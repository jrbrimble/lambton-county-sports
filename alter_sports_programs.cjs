require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

async function run() {
  const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

  try {
    await sql`
      ALTER TABLE sports_programs
      ADD COLUMN submitter_name VARCHAR(256),
      ADD COLUMN submitter_email VARCHAR(320),
      ADD COLUMN submitter_phone VARCHAR(50);
    `;
    console.log("Successfully added submitter columns to sports_programs table.");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await sql.end();
  }
}

run();
