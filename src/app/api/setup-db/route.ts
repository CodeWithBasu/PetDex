import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export const runtime = "nodejs";

export async function GET() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    "postgresql://placeholder:placeholder@localhost:5432/petdex";

  try {
    const sql = neon(databaseUrl);
    
    await sql`
      DO $$ BEGIN
       CREATE TYPE "public"."approval_status" AS ENUM('pending', 'approved', 'rejected');
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;
    `;
    
    await sql`
      DO $$ BEGIN
       CREATE TYPE "public"."pet_kind" AS ENUM('creature', 'object', 'character');
      EXCEPTION
       WHEN duplicate_object THEN null;
      END $$;
    `;

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

    await sql`CREATE INDEX IF NOT EXISTS "submitted_pets_status_idx" ON "submitted_pets" USING btree ("status");`;
    await sql`CREATE INDEX IF NOT EXISTS "submitted_pets_owner_idx" ON "submitted_pets" USING btree ("owner_id");`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS "submitted_pets_slug_unique" ON "submitted_pets" USING btree ("slug");`;
    
    return NextResponse.json({ success: true, message: "Database perfectly set up!" });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
