import { and, desc, eq, ilike, or, sql, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  AdSlot,
  CronConfig,
  InsertAdSlot,
  InsertCronConfig,
  InsertProgramChange,
  InsertSportsProgram,
  InsertUser,
  InsertSwapListing,
  ProgramChange,
  SportsProgram,
  SwapListing,
  User,
  alertSubscribers,
  AlertSubscriber,
  InsertAlertSubscriber,
  adSlots,
  cronConfig,
  programChanges,
  sportsPrograms,
  swapListings,
  users,
} from "../drizzle/schema.js";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL environment variable is not set");
    const client = postgres(url);
    _db = drizzle(client);
  }
  return _db;
}

//  Users

export async function createUser(
  data: Pick<
    InsertUser,
    | "email"
    | "passwordHash"
    | "name"
    | "role"
    | "phone"
    | "showEmail"
    | "showPhone"
  >
): Promise<number> {
  const db = getDb();
  const result = await db
    .insert(users)
    .values({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name ?? null,
      phone: data.phone ?? null,
      showEmail: data.showEmail ?? true,
      showPhone: data.showPhone ?? false,
      role: data.role ?? "user",
    })
    .returning({ id: users.id });
  return result[0].id;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);
  return result[0];
}

export async function updateUserRole(
  id: number,
  role: "user" | "admin"
): Promise<void> {
  const db = getDb();
  await db.update(users).set({ role }).where(eq(users.id, id));
}

export async function updateLastSignedIn(id: number): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, id));
}

//  Sports Programs

export async function listPrograms(filters?: {
  sport?: string;
  ageGroup?: string;
  status?: "open" | "upcoming" | "closed";
  search?: string;
  townArea?: string;
  ageMin?: number;
  ageMax?: number;
}): Promise<SportsProgram[]> {
  const db = getDb();
  const now = new Date();
  const conditions = [eq(sportsPrograms.isActive, true)];

  if (filters?.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        ilike(sportsPrograms.sportName, term),
        ilike(sportsPrograms.organization, term)
      )!
    );
  }

  if (filters?.sport) {
    conditions.push(ilike(sportsPrograms.sportName, `%${filters.sport}%`));
  }

  if (filters?.ageGroup) {
    conditions.push(ilike(sportsPrograms.ageGroups, `%${filters.ageGroup}%`));
  }

  if (filters?.townArea) {
    conditions.push(ilike(sportsPrograms.townArea, `%${filters.townArea}%`));
  }

  let rows = await db
    .select()
    .from(sportsPrograms)
    .where(and(...conditions))
    .orderBy(sportsPrograms.sportName);

  if (filters?.ageMin !== undefined || filters?.ageMax !== undefined) {
    const filterMin = filters?.ageMin ?? 0;
    const filterMax = filters?.ageMax ?? 99;
    rows = rows.filter(p => {
      const pMin = p.ageMin ?? 0;
      const pMax = p.ageMax ?? 99;
      return pMin <= filterMax && pMax >= filterMin;
    });
  }

  if (filters?.status) {
    rows = rows.filter(p => {
      const open = p.registrationOpenDate;
      const close = p.registrationCloseDate;
      if (filters.status === "open") {
        return open && close && open <= now && now <= close;
      }
      if (filters.status === "upcoming") {
        return open && open > now;
      }
      if (filters.status === "closed") {
        return close && close < now;
      }
      return true;
    });
  }

  return rows;
}

export async function listAllPrograms(): Promise<SportsProgram[]> {
  const db = getDb();
  return db.select().from(sportsPrograms).orderBy(sportsPrograms.sportName);
}

export async function getProgramById(
  id: number
): Promise<SportsProgram | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(sportsPrograms)
    .where(eq(sportsPrograms.id, id))
    .limit(1);
  return result[0];
}

export async function createProgram(
  data: InsertSportsProgram
): Promise<number> {
  const db = getDb();
  const result = await db
    .insert(sportsPrograms)
    .values(data)
    .returning({ id: sportsPrograms.id });
  return result[0].id;
}

export async function updateProgram(
  id: number,
  data: Partial<InsertSportsProgram>
): Promise<void> {
  const db = getDb();
  await db
    .update(sportsPrograms)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(sportsPrograms.id, id));
}

export async function deleteProgram(id: number): Promise<void> {
  const db = getDb();
  await db.delete(sportsPrograms).where(eq(sportsPrograms.id, id));
}

export async function getProgramsForCronCheck(): Promise<SportsProgram[]> {
  const db = getDb();
  return db
    .select()
    .from(sportsPrograms)
    .where(eq(sportsPrograms.isActive, true));
}

//  Program Changes

export async function createProgramChange(
  data: InsertProgramChange
): Promise<void> {
  const db = getDb();
  await db.insert(programChanges).values(data);
}

export async function listPendingChanges(): Promise<
  (ProgramChange & { programName: string; organization: string })[]
> {
  const db = getDb();
  const rows = await db
    .select({
      id: programChanges.id,
      programId: programChanges.programId,
      fieldName: programChanges.fieldName,
      oldValue: programChanges.oldValue,
      newValue: programChanges.newValue,
      status: programChanges.status,
      detectedAt: programChanges.detectedAt,
      reviewedAt: programChanges.reviewedAt,
      reviewedBy: programChanges.reviewedBy,
      programName: sportsPrograms.sportName,
      organization: sportsPrograms.organization,
    })
    .from(programChanges)
    .leftJoin(sportsPrograms, eq(programChanges.programId, sportsPrograms.id))
    .where(eq(programChanges.status, "pending"))
    .orderBy(desc(programChanges.detectedAt));
  return rows as (ProgramChange & {
    programName: string;
    organization: string;
  })[];
}

export async function approveChange(
  changeId: number,
  reviewerId: number
): Promise<void> {
  const db = getDb();
  const changes = await db
    .select()
    .from(programChanges)
    .where(eq(programChanges.id, changeId))
    .limit(1);
  if (!changes[0]) throw new Error("Change not found");
  const c = changes[0];

  const update: Record<string, unknown> = {};
  if (c.fieldName === "registrationOpenDate") {
    update.registrationOpenDate = c.newValue ? new Date(c.newValue) : null;
  } else if (c.fieldName === "registrationCloseDate") {
    update.registrationCloseDate = c.newValue ? new Date(c.newValue) : null;
  } else if (c.fieldName === "programStartDate") {
    update.programStartDate = c.newValue ? new Date(c.newValue) : null;
  } else {
    update[c.fieldName] = c.newValue;
  }

  await db
    .update(sportsPrograms)
    .set(update)
    .where(eq(sportsPrograms.id, c.programId));
  await db
    .update(programChanges)
    .set({
      status: "approved",
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    })
    .where(eq(programChanges.id, changeId));
}

export async function dismissChange(
  changeId: number,
  reviewerId: number
): Promise<void> {
  const db = getDb();
  await db
    .update(programChanges)
    .set({
      status: "dismissed",
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    })
    .where(eq(programChanges.id, changeId));
}

export async function countPendingChanges(): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(programChanges)
    .where(eq(programChanges.status, "pending"));
  return Number(result[0]?.count ?? 0);
}

//  Ad Slots

export async function listActiveAdSlots(position?: string): Promise<AdSlot[]> {
  const db = getDb();
  const conditions = [eq(adSlots.isActive, true)];
  if (position)
    conditions.push(eq(adSlots.position, position as AdSlot["position"]));
  return db
    .select()
    .from(adSlots)
    .where(and(...conditions))
    .orderBy(adSlots.sortOrder);
}

export async function listAllAdSlots(): Promise<AdSlot[]> {
  const db = getDb();
  return db.select().from(adSlots).orderBy(adSlots.position, adSlots.sortOrder);
}

export async function createAdSlot(data: InsertAdSlot): Promise<number> {
  const db = getDb();
  const result = await db
    .insert(adSlots)
    .values(data)
    .returning({ id: adSlots.id });
  return result[0].id;
}

export async function updateAdSlot(
  id: number,
  data: Partial<InsertAdSlot>
): Promise<void> {
  const db = getDb();
  await db
    .update(adSlots)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(adSlots.id, id));
}

export async function deleteAdSlot(id: number): Promise<void> {
  const db = getDb();
  await db.delete(adSlots).where(eq(adSlots.id, id));
}

//  Cron Config

export async function getCronConfig(
  jobName: string
): Promise<CronConfig | undefined> {
  const db = getDb();
  const result = await db
    .select()
    .from(cronConfig)
    .where(eq(cronConfig.jobName, jobName))
    .limit(1);
  return result[0];
}

export async function upsertCronConfig(data: InsertCronConfig): Promise<void> {
  const db = getDb();
  await db
    .insert(cronConfig)
    .values(data)
    .onConflictDoUpdate({
      target: cronConfig.jobName,
      set: {
        isEnabled: data.isEnabled,
        lastRunAt: data.lastRunAt,
        lastRunStatus: data.lastRunStatus,
      },
    });
}

export async function updateCronLastRun(
  jobName: string,
  status: string
): Promise<void> {
  const db = getDb();
  await db
    .update(cronConfig)
    .set({ lastRunAt: new Date(), lastRunStatus: status })
    .where(eq(cronConfig.jobName, jobName));
}

//  Swap Listings

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
      },
    })
    .from(swapListings)
    .innerJoin(users, eq(swapListings.userId, users.id))
    .where(
      and(eq(swapListings.status, "active"), gte(swapListings.expiresAt, now))
    )
    .orderBy(desc(swapListings.createdAt));

  let rows = await query;

  if (filters?.sport) {
    rows = rows.filter(r => r.listing.sportCategory === filters.sport);
  }
  if (filters?.townArea) {
    rows = rows.filter(r =>
      r.listing.townArea
        ?.toLowerCase()
        .includes(filters.townArea!.toLowerCase())
    );
  }
  if (filters?.condition) {
    rows = rows.filter(r => r.listing.condition === filters.condition);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      r =>
        r.listing.itemName.toLowerCase().includes(q) ||
        (r.listing.description &&
          r.listing.description.toLowerCase().includes(q)) ||
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

export async function updateSwapListingStatus(
  id: number,
  userId: number,
  status: string
): Promise<void> {
  const db = getDb();
  await db
    .update(swapListings)
    .set({ status })
    .where(and(eq(swapListings.id, id), eq(swapListings.userId, userId)));
}

export async function updateSwapListingAsAdmin(
  id: number,
  data: Partial<InsertSwapListing> & { status?: string }
): Promise<void> {
  const db = getDb();
  await db.update(swapListings).set(data).where(eq(swapListings.id, id));
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
      },
    })
    .from(swapListings)
    .leftJoin(users, eq(swapListings.userId, users.id))
    .orderBy(desc(swapListings.createdAt));
}

// ── Alert Subscribers ──────────────────────────────────────────────────────────

export async function createAlertSubscriber(data: InsertAlertSubscriber): Promise<number> {
  const db = getDb();
  const result = await db
    .insert(alertSubscribers)
    .values(data)
    .returning({ id: alertSubscribers.id });
  return result[0].id;
}

export async function listAlertSubscribers(): Promise<AlertSubscriber[]> {
  const db = getDb();
  return db
    .select()
    .from(alertSubscribers)
    .orderBy(desc(alertSubscribers.createdAt));
}

export async function deleteAlertSubscriber(id: number): Promise<void> {
  const db = getDb();
  await db.delete(alertSubscribers).where(eq(alertSubscribers.id, id));
}

export async function countAlertSubscribers(): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(alertSubscribers);
  return Number(result[0]?.count ?? 0);
}
