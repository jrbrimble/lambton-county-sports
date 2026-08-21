require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function run() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    console.log("Creating item_condition enum...");
    await sql`
      DO $$ BEGIN
        CREATE TYPE "item_condition" AS ENUM('like_new', 'good', 'fair', 'worn');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    
    console.log("Creating swap_listings table...");
    await sql`
      CREATE TABLE IF NOT EXISTS "swap_listings" (
        "id" serial PRIMARY KEY NOT NULL,
        "sport_category" varchar(128) NOT NULL,
        "item_name" varchar(256) NOT NULL,
        "description" text,
        "size_info" varchar(128),
        "condition" "item_condition" NOT NULL,
        "price" integer DEFAULT 0 NOT NULL,
        "image_url" text,
        "image_key" text,
        "town_area" varchar(128),
        "poster_name" varchar(128) NOT NULL,
        "poster_email" varchar(320) NOT NULL,
        "poster_phone" varchar(32),
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "expires_at" timestamp NOT NULL
      );
    `;
    console.log("Done!");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
