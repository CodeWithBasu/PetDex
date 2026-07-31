const { neon } = require('@neondatabase/serverless');

const sql = neon('postgresql://neondb_owner:npg_YkPav4DMmZK3@ep-jolly-poetry-atlftnvm-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require');

async function main() {
  console.log("Creating approval_status enum...");
  await sql`
    DO $$ BEGIN
     CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;
  `;

  console.log("Creating pet_kind enum...");
  await sql`
    DO $$ BEGIN
     CREATE TYPE "public"."pet_kind" AS ENUM('creature', 'object', 'character');
    EXCEPTION
     WHEN duplicate_object THEN null;
    END $$;
  `;

  console.log("Creating submitted_pets table...");
  await sql`
    CREATE TABLE IF NOT EXISTS "submitted_pets" (
      "id" text PRIMARY KEY NOT NULL,
      "slug" text NOT NULL,
      "display_name" text NOT NULL,
      "description" text NOT NULL,
      "spritesheet_url" text NOT NULL,
      "pet_json_url" text NOT NULL,
      "zip_url" text NOT NULL,
      "kind" "pet_kind" DEFAULT 'creature' NOT NULL,
      "vibes" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "status" "approval_status" DEFAULT 'pending' NOT NULL,
      "owner_id" text NOT NULL,
      "owner_email" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "approved_at" timestamp with time zone,
      "rejected_at" timestamp with time zone,
      "rejection_reason" text
    );
  `;

  console.log("Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS "submitted_pets_status_idx" ON "submitted_pets" USING btree ("status");`;
  await sql`CREATE INDEX IF NOT EXISTS "submitted_pets_owner_idx" ON "submitted_pets" USING btree ("owner_id");`;
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS "submitted_pets_slug_unique" ON "submitted_pets" USING btree ("slug");`;
  
  console.log("Database perfectly set up!");
}

main().catch(console.error);
