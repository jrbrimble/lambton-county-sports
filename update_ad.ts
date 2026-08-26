import { getDb } from "./server/db.js";
import { adSlots } from "./drizzle/schema.js";
import { eq, like } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

async function updateTangs() {
  const db = getDb();
  await db
    .update(adSlots)
    .set({ position: "sidebar_card" })
    .where(like(adSlots.title, "%Tang%"));
  console.log("Updated Tangs to sidebar_card");
  process.exit(0);
}

updateTangs().catch(console.error);
