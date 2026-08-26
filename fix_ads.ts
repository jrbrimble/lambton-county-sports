import { getDb } from "./server/db.js";
import { adSlots } from "./drizzle/schema.js";
import { eq, like } from "drizzle-orm";
import { config } from "dotenv";

config({ path: ".env.local" });

async function fixAds() {
  const db = getDb();

  // 1. Find the Ironworks ad we just modified
  const ironworks = await db
    .select()
    .from(adSlots)
    .where(like(adSlots.title, "%Ironworks%"));

  if (ironworks.length > 0) {
    // Revert the first one back to banner_top and the old banner image
    await db
      .update(adSlots)
      .set({
        position: "banner_top",
        imageUrl: "/ironworks-sponsor-banner.png",
      })
      .where(eq(adSlots.id, ironworks[0].id));

    // Insert a NEW ad for the sidebar logo
    await db.insert(adSlots).values({
      title: "Ironworks Fitness (Sidebar)",
      position: "sidebar_card",
      imageUrl: "/ironworks-logo.webp",
      destinationUrl: "https://ironworksfitness.ca/",
      sortOrder: 1,
      isActive: true,
    });
  }

  console.log("Fixed ads!");
  process.exit(0);
}

fixAds().catch(console.error);
