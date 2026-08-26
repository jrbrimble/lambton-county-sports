import type { Request, Response } from "express";
import { getDb } from "./db.js";
import { sportsPrograms } from "../drizzle/schema.js";

export async function programSubmissionWebhookHandler(req: Request, res: Response) {
  try {
    // 1. Verify Secret
    const hlSecret = req.headers["x-hl-secret"];
    if (hlSecret !== "quote-directory-archery") {
      return res.status(403).json({ error: "Forbidden: Invalid webhook secret." });
    }

    const data = req.body;
    console.log("[Webhook] Received program submission:", data);

    // 2. Parse payload from HighLevel
    // We expect these keys from the HL webhook:
    const {
      sportName,
      organization,
      townArea,
      ageGroups,
      registrationUrl,
      websiteUrl,
      notes,
    } = data;

    if (!sportName || !organization || !ageGroups || !registrationUrl) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const db = await getDb();
    
    // 3. Insert into database (isActive = false so it's pending review)
    await db.insert(sportsPrograms).values({
      sportName: sportName.trim(),
      organization: organization.trim(),
      townArea: townArea ? townArea.trim() : null,
      ageGroups: ageGroups.trim(),
      registrationUrl: registrationUrl.trim(),
      websiteUrl: websiteUrl ? websiteUrl.trim() : null,
      notes: notes ? notes.trim() : null,
      isActive: false, // Must be manually activated in Admin
    });

    console.log("[Webhook] Successfully inserted pending program:", sportName);
    return res.status(200).json({ success: true, message: "Program submitted successfully." });

  } catch (err: any) {
    console.error("[Webhook] Error processing submission:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
