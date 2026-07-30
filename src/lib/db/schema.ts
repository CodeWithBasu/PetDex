import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const approvalStatus = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const petKind = pgEnum("pet_kind", ["creature", "object", "character"]);

export const submittedPets = pgTable(
  "submitted_pets",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    displayName: text("display_name").notNull(),
    description: text("description").notNull(),
    spritesheetUrl: text("spritesheet_url").notNull(),
    petJsonUrl: text("pet_json_url").notNull(),
    zipUrl: text("zip_url").notNull(),
    kind: petKind("kind").notNull().default("creature"),
    vibes: jsonb("vibes").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    tags: jsonb("tags").$type<string[]>().notNull().default(sql`'[]'::jsonb`),
    status: approvalStatus("status").notNull().default("pending"),
    ownerId: text("owner_id").notNull(),
    ownerEmail: text("owner_email"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    rejectedAt: timestamp("rejected_at", { withTimezone: true }),
    rejectionReason: text("rejection_reason"),
  },
  (table) => ({
    statusIdx: index("submitted_pets_status_idx").on(table.status),
    ownerIdx: index("submitted_pets_owner_idx").on(table.ownerId),
    slugUnique: uniqueIndex("submitted_pets_slug_unique").on(table.slug),
  }),
);

export type SubmittedPet = typeof submittedPets.$inferSelect;
export type NewSubmittedPet = typeof submittedPets.$inferInsert;
