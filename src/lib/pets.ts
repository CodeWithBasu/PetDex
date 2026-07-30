import { pets } from "@/data/pets.generated";

export function getPets() {
  return pets;
}

export function getPet(slug: string) {
  return pets.find((pet) => pet.slug === slug);
}

export function getPetStats() {
  return {
    total: pets.length,
    approved: pets.filter((pet) => pet.approvalState === "approved").length,
  };
}
