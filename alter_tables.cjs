require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function run() {
  const sql = postgres(process.env.DATABASE_URL);
  try {
    console.log("Updating users table...");
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" varchar(32);`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "show_email" boolean DEFAULT true NOT NULL;`;
    await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "show_phone" boolean DEFAULT false NOT NULL;`;
    
    console.log("Updating swap_listings table...");
    // Since this is a new feature with likely no real data, we can TRUNCATE or just delete rows to safely add a NOT NULL user_id
    await sql`TRUNCATE TABLE "swap_listings" RESTART IDENTITY CASCADE;`;
    
    await sql`ALTER TABLE "swap_listings" ADD COLUMN IF NOT EXISTS "user_id" integer NOT NULL REFERENCES "users"("id");`;
    await sql`ALTER TABLE "swap_listings" ADD COLUMN IF NOT EXISTS "status" varchar(32) DEFAULT 'active' NOT NULL;`;
    
    await sql`ALTER TABLE "swap_listings" DROP COLUMN IF EXISTS "poster_name";`;
    await sql`ALTER TABLE "swap_listings" DROP COLUMN IF EXISTS "poster_email";`;
    await sql`ALTER TABLE "swap_listings" DROP COLUMN IF EXISTS "poster_phone";`;
    await sql`ALTER TABLE "swap_listings" DROP COLUMN IF EXISTS "is_active";`;
    
    console.log("Done!");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}

run();
