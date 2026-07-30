import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import JSZip from "jszip";

import { pets } from "../src/data/pets.generated";

const root = process.cwd();
const packsDir = path.join(root, "public", "packs");

await mkdir(packsDir, { recursive: true });

const allPetsZip = new JSZip();

for (const pet of pets) {
  const zip = new JSZip();
  const petDir = path.join(root, "public", "pets", pet.slug);
  const files = [
    ["pet.json", "pet.json"],
    ["spritesheet.webp", "spritesheet.webp"],
    ["metadata.json", "metadata.json"],
  ] as const;

  for (const [source, target] of files) {
    const buffer = await readFile(path.join(petDir, source));
    zip.file(target, buffer);
    allPetsZip.file(`${pet.slug}/${target}`, buffer);
  }

  const readme = [
    `# ${pet.displayName}`,
    "",
    pet.description,
    "",
    "## Install locally",
    "",
    "```bash",
    `mkdir -p ~/.codex/pets/${pet.slug}`,
    `unzip ${pet.slug}.zip -d ~/.codex/pets/${pet.slug}`,
    "```",
    "",
    "Generated for Petdex.",
    "",
  ].join("\n");

  zip.file("README.md", readme);
  allPetsZip.file(`${pet.slug}/README.md`, readme);

  const pack = await zip.generateAsync({ type: "uint8array" });
  await writeFile(path.join(packsDir, `${pet.slug}.zip`), pack);
}

const manifest = {
  generatedAt: new Date().toISOString(),
  pets: pets.map((pet) => ({
    slug: pet.slug,
    displayName: pet.displayName,
    packPath: `/packs/${pet.slug}.zip`,
  })),
};

allPetsZip.file("manifest.json", JSON.stringify(manifest, null, 2));

const allPack = await allPetsZip.generateAsync({ type: "uint8array" });
await writeFile(path.join(packsDir, "petdex-approved.zip"), allPack);
await writeFile(
  path.join(packsDir, "manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);

console.log(`Built ${pets.length} pet pack(s) in public/packs`);
