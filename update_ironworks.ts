import { getDb } from "./server/db.js";
import { adSlots } from "./drizzle/schema.js";
import { eq, like } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

async function updateAds() {
  const db = getDb();

  // First, check if ironworks exists
  const existingIronworks = await db
    .select()
    .from(adSlots)
    .where(like(adSlots.title, "%Ironworks%"));

  if (existingIronworks.length > 0) {
    // Update existing
    await db
      .update(adSlots)
      .set({
        position: "sidebar_card",
        imageUrl: "/ironworks-logo.webp",
        destinationUrl: "https://ironworksfitness.ca/",
        sortOrder: 1,
      })
      .where(eq(adSlots.id, existingIronworks[0].id));
  } else {
    // Insert new
    await db.insert(adSlots).values({
      title: "Ironworks Fitness",
      position: "sidebar_card",
      imageUrl: "/ironworks-logo.webp",
      destinationUrl: "https://ironworksfitness.ca/",
      sortOrder: 1,
      isActive: true,
    });
  }

  // Ensure Tangs is below it (sortOrder 2)
  await db
    .update(adSlots)
    .set({ sortOrder: 2 })
    .where(like(adSlots.title, "%Tang%"));

  console.log("Updated Ironworks and Tangs order");
  process.exit(0);
}

updateAds().catch(console.error);
