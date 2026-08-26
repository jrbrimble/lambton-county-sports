import { getDb } from "./server/db.js";
import { adSlots } from "./drizzle/schema.js";
import { config } from "dotenv";

config({ path: ".env.local" });

async function seedInlineAds() {
  const db = getDb();

  // Insert Tangs as an inline ad
  await db.insert(adSlots).values({
    title: "Tangs China House (Inline)",
    position: "inline_card",
    imageUrl: "/tangs-china-house-sponsor.png",
    destinationUrl: "https://tangschinahouse.com/",
    sortOrder: 1,
    isActive: true,
  });

  // Insert Ironworks as an inline ad
  await db.insert(adSlots).values({
    title: "Ironworks Fitness (Inline)",
    position: "inline_card",
    imageUrl: "/ironworks-logo.webp",
    destinationUrl: "https://ironworksfitness.ca/",
    sortOrder: 2,
    isActive: true,
  });

  console.log("Seeded inline ads!");
  process.exit(0);
}

seedInlineAds().catch(console.error);
