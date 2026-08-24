const fs = require('fs');
let content = fs.readFileSync('server/db.ts', 'utf8');

if (!content.includes('updateSwapListingAsAdmin')) {
  const funcStr = `
export async function updateSwapListingAsAdmin(id: number, data: Partial<InsertSwapListing> & { status?: string }): Promise<void> {
  const db = getDb();
  await db
    .update(swapListings)
    .set(data)
    .where(eq(swapListings.id, id));
}
`;
  content = content.replace('export async function deleteSwapListing(id: number): Promise<void> {', funcStr + 'export async function deleteSwapListing(id: number): Promise<void> {');
  fs.writeFileSync('server/db.ts', content);
  console.log('Added updateSwapListingAsAdmin');
}
