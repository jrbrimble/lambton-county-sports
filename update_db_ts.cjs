const fs = require("fs");
let content = fs.readFileSync("server/db.ts", "utf8");

const oldSwapBlockRegex = /\/\/ ── Swap Listings ──[\s\S]*$/;
const newSwapBlock = `// ── Swap Listings ──────────────────────────────────────────────────────────────

export async function listActiveSwapListings(filters?: {
  sport?: string;
  townArea?: string;
  condition?: string;
  search?: string;
}) {
  const db = getDb();
  const now = new Date();
  
  // We need to join with users table to get the contact info
  let query = db
    .select({
      listing: swapListings,
      user: {
        name: users.name,
        email: users.email,
        phone: users.phone,
        showEmail: users.showEmail,
        showPhone: users.showPhone,
      }
    })
    .from(swapListings)
    .innerJoin(users, eq(swapListings.userId, users.id))
    .where(
      and(
        eq(swapListings.status, 'active'),
        gte(swapListings.expiresAt, now)
      )
    )
    .orderBy(desc(swapListings.createdAt));

  let rows = await query;

  if (filters?.sport) {
    rows = rows.filter((r) => r.listing.sportCategory === filters.sport);
  }
  if (filters?.townArea) {
    rows = rows.filter((r) => r.listing.townArea?.toLowerCase().includes(filters.townArea!.toLowerCase()));
  }
  if (filters?.condition) {
    rows = rows.filter((r) => r.listing.condition === filters.condition);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.listing.itemName.toLowerCase().includes(q) ||
        (r.listing.description && r.listing.description.toLowerCase().includes(q)) ||
        r.listing.sportCategory.toLowerCase().includes(q)
    );
  }
  return rows;
}

export async function listUserSwapListings(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(swapListings)
    .where(eq(swapListings.userId, userId))
    .orderBy(desc(swapListings.createdAt));
}

export async function createSwapListing(
  data: InsertSwapListing
): Promise<number> {
  const db = getDb();
  const result = await db
    .insert(swapListings)
    .values(data)
    .returning({ id: swapListings.id });
  return result[0].id;
}

export async function updateSwapListingStatus(id: number, userId: number, status: string): Promise<void> {
  const db = getDb();
  await db
    .update(swapListings)
    .set({ status })
    .where(and(eq(swapListings.id, id), eq(swapListings.userId, userId)));
}

export async function deleteSwapListing(id: number): Promise<void> {
  const db = getDb();
  // Admin only delete
  await db.delete(swapListings).where(eq(swapListings.id, id));
}

export async function listAllSwapListings() {
  const db = getDb();
  return db
    .select({
      listing: swapListings,
      user: {
        name: users.name,
        email: users.email,
        phone: users.phone,
      }
    })
    .from(swapListings)
    .leftJoin(users, eq(swapListings.userId, users.id))
    .orderBy(desc(swapListings.createdAt));
}
`;

content = content.replace(oldSwapBlockRegex, newSwapBlock);
fs.writeFileSync("server/db.ts", content);
console.log("db.ts updated successfully");
