import { pets } from "@/data/pets.generated";
import { listAllSubmittedPets } from "@/lib/db/queries";
import { PetdexPet, PetVibe } from "@/lib/types";

export function getPets() {
  return pets;
}

export function getPet(slug: string) {
  return pets.find((pet) => pet.slug === slug);
}

export async function getMergedPets(): Promise<PetdexPet[]> {
  const dbPets = await listAllSubmittedPets();
  const approvedDbPets = dbPets.filter((p) => p.status === "approved");
  
  const mappedDbPets: PetdexPet[] = approvedDbPets.map((p) => ({
    id: p.id,
    slug: p.slug,
    displayName: p.displayName,
    description: p.description,
    spritesheetPath: p.spritesheetUrl,
    petJsonPath: p.petJsonUrl,
    zipUrl: p.zipUrl,
    approvalState: "approved",
    featured: false,
    kind: p.kind,
    vibes: (p.vibes || []) as PetVibe[],
    tags: (p.tags || []) as string[],
    importedAt: p.approvedAt?.toISOString() || p.createdAt.toISOString(),
    qa: {},
  }));

  const merged = [...mappedDbPets, ...pets];
  merged.sort((a, b) => a.displayName.localeCompare(b.displayName));
  return merged;
}

export async function getMergedPet(slug: string): Promise<PetdexPet | undefined> {
  const allPets = await getMergedPets();
  return allPets.find((p) => p.slug === slug);
}

export function getPetStats() {
  return {
    total: pets.length,
    approved: pets.filter((pet) => pet.approvalState === "approved").length,
  };
}

export async function getMergedPetStats() {
  const allPets = await getMergedPets();
  return {
    total: allPets.length,
    approved: allPets.length, // Since they are all approved in getMergedPets
  };
}
