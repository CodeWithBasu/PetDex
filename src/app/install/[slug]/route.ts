import { eq } from "drizzle-orm";

import { db, schema } from "@/lib/db/client";
import { getPets } from "@/lib/pets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function GET(
  req: Request,
  ctx: { params: Promise<Params> },
): Promise<Response> {
  const { slug } = await ctx.params;
  const origin = new URL(req.url).origin;

  const curated = getPets().find((p) => p.slug === slug);

  let petJsonUrl: string;
  let spritesheetUrl: string;
  let displayName: string;

  if (curated) {
    petJsonUrl = `${origin}${curated.petJsonPath}`;
    spritesheetUrl = `${origin}${curated.spritesheetPath}`;
    displayName = curated.displayName;
  } else {
    const submitted = await db.query.submittedPets.findFirst({
      where: eq(schema.submittedPets.slug, slug),
    });
    if (!submitted || submitted.status !== "approved") {
      return new Response(notFoundScript(slug), {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    petJsonUrl = submitted.petJsonUrl;
    spritesheetUrl = submitted.spritesheetUrl;
    displayName = submitted.displayName;
  }

  return new Response(
    installScript({ slug, displayName, petJsonUrl, spritesheetUrl }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/x-shellscript; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
}

function installScript(args: {
  slug: string;
  displayName: string;
  petJsonUrl: string;
  spritesheetUrl: string;
}): string {
  const { slug, displayName, petJsonUrl, spritesheetUrl } = args;
  return [
    "#!/bin/sh",
    `# Petdex installer for "${displayName}"`,
    `# https://petdex.crafter.run/pets/${slug}`,
    "",
    "set -e",
    "",
    `PET_DIR="$HOME/.codex/pets/${slug}"`,
    "",
    `echo "Installing ${displayName} into $PET_DIR"`,
    'mkdir -p "$PET_DIR"',
    "",
    `curl -fsSL -o "$PET_DIR/pet.json" '${petJsonUrl}'`,
    `curl -fsSL -o "$PET_DIR/spritesheet.webp" '${spritesheetUrl}'`,
    "",
    `echo "Installed: ${displayName}"`,
    'echo "Path:      $PET_DIR"',
    'echo ""',
    'echo "Restart Codex to see your new pet."',
    "",
  ].join("\n");
}

function notFoundScript(slug: string): string {
  return [
    "#!/bin/sh",
    `echo "Pet '${slug}' not found in Petdex." >&2`,
    'echo "Browse pets at https://petdex.crafter.run" >&2',
    "exit 1",
    "",
  ].join("\n");
}
