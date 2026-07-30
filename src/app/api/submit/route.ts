import { NextResponse } from "next/server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Resend } from "resend";

import { db, schema } from "@/lib/db/client";
import { getPet } from "@/lib/pets";
import { submitRatelimit } from "@/lib/ratelimit";

export const runtime = "nodejs";

type SubmitBody = {
  zipUrl: string;
  spritesheetUrl: string;
  petJsonUrl: string;
  displayName: string;
  description: string;
  petId: string;
  spritesheetWidth: number;
  spritesheetHeight: number;
};

const REQUIRED_DIMS = { width: 1536, height: 1872 } as const;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const limit = await submitRatelimit.limit(userId);
  if (!limit.success) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "Limit reached: 3 submissions / 24h. Try again tomorrow.",
        retryAfter: limit.reset,
      },
      { status: 429 },
    );
  }

  let body: SubmitBody;
  try {
    body = (await req.json()) as SubmitBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const requiredFields = [
    "zipUrl",
    "spritesheetUrl",
    "petJsonUrl",
    "displayName",
    "description",
    "petId",
    "spritesheetWidth",
    "spritesheetHeight",
  ] as const;

  for (const field of requiredFields) {
    if (!body[field]) {
      return NextResponse.json(
        { error: "missing_field", field },
        { status: 400 },
      );
    }
  }

  if (
    body.spritesheetWidth !== REQUIRED_DIMS.width ||
    body.spritesheetHeight !== REQUIRED_DIMS.height
  ) {
    return NextResponse.json(
      {
        error: "invalid_spritesheet",
        message: `Spritesheet must be ${REQUIRED_DIMS.width}x${REQUIRED_DIMS.height}.`,
        got: { width: body.spritesheetWidth, height: body.spritesheetHeight },
      },
      { status: 400 },
    );
  }

  const requestedSlug = slugify(body.petId || body.displayName);
  if (!requestedSlug) {
    return NextResponse.json({ error: "invalid_slug" }, { status: 400 });
  }

  const slug = await resolveUniqueSlug(requestedSlug);

  const user = await currentUser();
  const ownerEmail =
    user?.emailAddresses?.[0]?.emailAddress ??
    user?.primaryEmailAddress?.emailAddress ??
    null;

  const id = `pet_${crypto.randomUUID().replace(/-/g, "").slice(0, 22)}`;

  await db.insert(schema.submittedPets).values({
    id,
    slug,
    displayName: body.displayName.trim().slice(0, 60),
    description: body.description.trim().slice(0, 280),
    spritesheetUrl: body.spritesheetUrl,
    petJsonUrl: body.petJsonUrl,
    zipUrl: body.zipUrl,
    kind: "creature",
    vibes: [],
    tags: [],
    status: "pending",
    ownerId: userId,
    ownerEmail,
  });

  // Notify owner email (Resend) — silent fail if not configured
  const resendKey = process.env.RESEND_API_KEY;
  const ownerNotify = process.env.PETDEX_OWNER_EMAIL;
  if (resendKey && ownerNotify) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Petdex <petdex@notifications.crafter.run>",
        to: ownerNotify,
        subject: `New pet submission: ${body.displayName}`,
        text: [
          `Pet: ${body.displayName} (${slug})`,
          `From: ${ownerEmail ?? userId}`,
          "",
          body.description,
          "",
          `Sprite: ${body.spritesheetUrl}`,
          `Zip:    ${body.zipUrl}`,
        ].join("\n"),
      });
    } catch {
      /* silent */
    }
  }

  return NextResponse.json({ ok: true, id, slug }, { status: 201 });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

async function resolveUniqueSlug(base: string): Promise<string> {
  const isTaken = async (candidate: string): Promise<boolean> => {
    if (getPet(candidate)) return true;
    const row = await db.query.submittedPets.findFirst({
      where: eq(schema.submittedPets.slug, candidate),
    });
    return Boolean(row);
  };

  if (!(await isTaken(base))) return base;

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}-${i}`.slice(0, 40);
    if (!(await isTaken(candidate))) return candidate;
  }

  // last resort: append short random hex
  return `${base.slice(0, 32)}-${crypto.randomUUID().slice(0, 6)}`;
}
