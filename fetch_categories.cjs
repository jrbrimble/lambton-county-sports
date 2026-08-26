require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function run() {
  const sports = await sql`SELECT DISTINCT sport_name FROM sports_programs ORDER BY sport_name`;
  const towns = await sql`SELECT DISTINCT town_area FROM sports_programs WHERE town_area IS NOT NULL ORDER BY town_area`;
  console.log('SPORTS:', sports.map(s => s.sport_name));
  console.log('TOWNS:', towns.map(t => t.town_area));
  process.exit(0);
}
run();
