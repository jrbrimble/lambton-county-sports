import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

//  Enums

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const changeStatusEnum = pgEnum("change_status", [
  "pending",
  "approved",
  "dismissed",
]);
export const adPositionEnum = pgEnum("ad_position", [
  "banner_top",
  "banner_bottom",
  "sidebar_card",
  "inline_card",
]);

//  Users

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  phone: varchar("phone", { length: 32 }),
  showEmail: boolean("show_email").default(true).notNull(),
  showPhone: boolean("show_phone").default(false).notNull(),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

//  Sports Programs

export const sportsPrograms = pgTable("sports_programs", {
  id: serial("id").primaryKey(),
  sportName: varchar("sport_name", { length: 128 }).notNull(),
  organization: varchar("organization", { length: 256 }).notNull(),
  townArea: varchar("town_area", { length: 128 }),
  ageGroups: varchar("age_groups", { length: 256 }).notNull(),
  ageMin: integer("age_min"),
  ageMax: integer("age_max"),
  registrationOpenDate: timestamp("registration_open_date"),
  registrationCloseDate: timestamp("registration_close_date"),
  programStartDate: timestamp("program_start_date"),
  programEndDate: timestamp("program_end_date"),
  websiteUrl: text("website_url"),
  registrationUrl: text("registration_url").notNull(),
  notes: text("notes"),
  submitterName: varchar("submitter_name", { length: 256 }),
  submitterEmail: varchar("submitter_email", { length: 320 }),
  submitterPhone: varchar("submitter_phone", { length: 50 }),
  isActive: boolean("is_active").default(true).notNull(),
  lastCheckedAt: timestamp("last_checked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SportsProgram = typeof sportsPrograms.$inferSelect;
export type InsertSportsProgram = typeof sportsPrograms.$inferInsert;

//  Program Changes

export const programChanges = pgTable("program_changes", {
  id: serial("id").primaryKey(),
  programId: integer("program_id").notNull(),
  fieldName: varchar("field_name", { length: 64 }).notNull(),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  status: changeStatusEnum("status").default("pending").notNull(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by"),
});

export type ProgramChange = typeof programChanges.$inferSelect;
export type InsertProgramChange = typeof programChanges.$inferInsert;

//  Ad Slots

export const adSlots = pgTable("ad_slots", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 128 }).notNull(),
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  destinationUrl: text("destination_url").notNull(),
  position: adPositionEnum("position").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AdSlot = typeof adSlots.$inferSelect;
export type InsertAdSlot = typeof adSlots.$inferInsert;

//  Cron Config

export const cronConfig = pgTable("cron_config", {
  id: serial("id").primaryKey(),
  jobName: varchar("job_name", { length: 128 }).notNull().unique(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  lastRunAt: timestamp("last_run_at"),
  lastRunStatus: varchar("last_run_status", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CronConfig = typeof cronConfig.$inferSelect;
export type InsertCronConfig = typeof cronConfig.$inferInsert;

//  Equipment Swap Listings

export const itemConditionEnum = pgEnum("item_condition", [
  "like_new",
  "good",
  "fair",
  "worn",
]);

export const swapListings = pgTable("swap_listings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  sportCategory: varchar("sport_category", { length: 128 }).notNull(),
  itemName: varchar("item_name", { length: 256 }).notNull(),
  description: text("description"),
  sizeInfo: varchar("size_info", { length: 128 }),
  condition: itemConditionEnum("condition").notNull(),
  price: integer("price").default(0).notNull(), // cents, 0 = free
  imageUrl: text("image_url"),
  imageKey: text("image_key"),
  townArea: varchar("town_area", { length: 128 }),
  status: varchar("status", { length: 32 }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type SwapListing = typeof swapListings.$inferSelect;
export type InsertSwapListing = typeof swapListings.$inferInsert;

// ── Alert Subscribers ──────────────────────────────────────────────────────────

export const alertSubscribers = pgTable("alert_subscribers", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull(),
  sports: text("sports"),
  townArea: varchar("town_area", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AlertSubscriber = typeof alertSubscribers.$inferSelect;
export type InsertAlertSubscriber = typeof alertSubscribers.$inferInsert;
