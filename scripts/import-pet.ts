import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";

import type { PetdexPet } from "../src/lib/types";

type CodexPetJson = {
  id?: string;
  displayName?: string;
  description?: string;
  spritesheetPath?: string;
};

const appRoot = process.cwd();
const sourcePath = process.argv[2];

if (!sourcePath) {
  console.error("Usage: bun run import-pet /absolute/path/to/pet-folder");
  process.exit(1);
}

const sourceDir = path.resolve(sourcePath);
const sourcePetJsonPath = path.join(sourceDir, "pet.json");
const rawPetJson = await readFile(sourcePetJsonPath, "utf8");
const petJson = JSON.parse(rawPetJson) as CodexPetJson;
const slug = slugify(
  petJson.id ?? petJson.displayName ?? path.basename(sourceDir),
);
const displayName = petJson.displayName ?? titleize(slug);
const description =
  petJson.description ?? `A Codex-compatible digital pet named ${displayName}.`;
const spritesheetFile = petJson.spritesheetPath ?? "spritesheet.webp";
const sourceSpritesheetPath = path.join(sourceDir, spritesheetFile);

await assertFile(sourceSpritesheetPath);

const targetDir = path.join(appRoot, "public", "pets", slug);
await mkdir(targetDir, { recursive: true });

await copyFile(sourcePetJsonPath, path.join(targetDir, "pet.json"));
await copyFile(sourceSpritesheetPath, path.join(targetDir, "spritesheet.webp"));

const qa = await copyQaAssets(sourceDir, targetDir, slug);
const metadata: PetdexPet = {
  id: petJson.id ?? slug,
  slug,
  displayName,
  description,
  spritesheetPath: `/pets/${slug}/spritesheet.webp`,
  petJsonPath: `/pets/${slug}/pet.json`,
  approvalState: "approved",
  kind: "creature",
  vibes: [],
  tags: inferTags(`${displayName} ${description}`),
  importedAt: new Date().toISOString(),
  qa,
};

await writeFile(
  path.join(targetDir, "metadata.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
);

await writeGeneratedIndex();

console.log(`Imported ${displayName} into public/pets/${slug}`);

async function copyQaAssets(
  source: string,
  target: string,
  slug: string,
): Promise<PetdexPet["qa"]> {
  const candidates = [
    ["qa/contact-sheet.png", "contact-sheet.png", "contactSheetPath"],
  ] as const;
  const qa: PetdexPet["qa"] = {};

  for (const [relativeSource, targetName, key] of candidates) {
    const candidate = path.join(source, relativeSource);
    if (await fileExists(candidate)) {
      await copyFile(candidate, path.join(target, targetName));
      qa[key] = `/pets/${slug}/${targetName}`;
    }
  }

  return qa;
}

async function writeGeneratedIndex() {
  const petsRoot = path.join(appRoot, "public", "pets");
  await mkdir(petsRoot, { recursive: true });
  const directories = await readdir(petsRoot, { withFileTypes: true });
  const entries = directories
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(entry.name, "metadata.json"));
  const pets = await Promise.all(
    entries.map(async (entry) => {
      const raw = await readFile(path.join(petsRoot, entry), "utf8");
      return JSON.parse(raw) as PetdexPet;
    }),
  );

  pets.sort((a, b) => a.displayName.localeCompare(b.displayName));

  const source = [
    'import type { PetdexPet } from "@/lib/types";',
    "",
    `export const pets: PetdexPet[] = ${JSON.stringify(pets, null, 2)};`,
    "",
  ].join("\n");

  await writeFile(
    path.join(appRoot, "src", "data", "pets.generated.ts"),
    source,
  );
}

function inferTags(text: string) {
  const normalized = text.toLowerCase();
  const tags = new Set<string>();

  for (const [needle, tag] of [
    ["cat", "cat"],
    ["dog", "dog"],
    ["duck", "duck"],
    ["astronaut", "astronaut"],
    ["astronaut", "space"],
    ["space", "space"],
    ["microwave", "object-pet"],
    ["otter", "otter"],
    ["rabbit", "rabbit"],
    ["bunny", "rabbit"],
    ["capybara", "capybara"],
    ["koala", "koala"],
    ["panda", "panda"],
    ["penguin", "penguin"],
    ["ice cream", "sweet"],
    ["bubble tea", "drink"],
    ["box", "cozy"],
    ["cardboard", "cozy"],
    ["calm", "calm"],
    ["cheerful", "cheerful"],
    ["pixel", "pixel"],
    ["scroll", "scroll"],
    ["prompt", "prompt"],
    ["keyboard", "keyboard"],
    ["fintech", "fintech"],
    ["snack", "snacks"],
  ] as const) {
    if (normalized.includes(needle)) {
      tags.add(tag);
    }
  }

  return [...tags];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleize(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function assertFile(filePath: string) {
  const stats = await stat(filePath);
  if (!stats.isFile()) {
    throw new Error(`${filePath} is not a file`);
  }
}

async function fileExists(filePath: string) {
  try {
    await assertFile(filePath);
    return true;
  } catch {
    return false;
  }
}
