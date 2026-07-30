import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { isAdmin } from "@/lib/admin";
import { db, schema } from "@/lib/db/client";

export const runtime = "nodejs";

type Params = { id: string };

type PatchBody = {
  action: "approve" | "reject";
  reason?: string | null;
};

export async function PATCH(
  req: Request,
  ctx: { params: Promise<Params> },
): Promise<Response> {
  const { userId } = await auth();
  if (!isAdmin(userId)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await ctx.params;

  let body: PatchBody;
  try {
    body = (await req.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (body.action !== "approve" && body.action !== "reject") {
    return NextResponse.json({ error: "invalid_action" }, { status: 400 });
  }

  const now = new Date();
  const update =
    body.action === "approve"
      ? { status: "approved" as const, approvedAt: now, rejectedAt: null, rejectionReason: null }
      : {
          status: "rejected" as const,
          rejectedAt: now,
          approvedAt: null,
          rejectionReason: body.reason?.trim() || null,
        };

  const [row] = await db
    .update(schema.submittedPets)
    .set(update)
    .where(eq(schema.submittedPets.id, id))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, status: row.status });
}
