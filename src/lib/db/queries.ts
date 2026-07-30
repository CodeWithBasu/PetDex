import { desc, eq } from "drizzle-orm";

import { db, schema } from "./client";
import type { SubmittedPet } from "./schema";

export async function listSubmittedPetsByStatus(
  status: SubmittedPet["status"],
): Promise<SubmittedPet[]> {
  return db
    .select()
    .from(schema.submittedPets)
    .where(eq(schema.submittedPets.status, status))
    .orderBy(desc(schema.submittedPets.createdAt));
}

export async function listAllSubmittedPets(): Promise<SubmittedPet[]> {
  return db
    .select()
    .from(schema.submittedPets)
    .orderBy(desc(schema.submittedPets.createdAt));
}

export async function getSubmittedPetById(
  id: string,
): Promise<SubmittedPet | null> {
  const row = await db.query.submittedPets.findFirst({
    where: eq(schema.submittedPets.id, id),
  });
  return row ?? null;
}
