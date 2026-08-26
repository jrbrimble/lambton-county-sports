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
      submitterName,
      submitterEmail,
      submitterPhone,
      sportName,
      organization,
      townArea,
      ageGroups,
      registrationUrl,
      websiteUrl,
      notes,
    } = data;

    const parseField = (val: any): string => {
      if (Array.isArray(val)) return val.join(", ").trim();
      if (typeof val === "string") return val.trim();
      return String(val || "").trim();
    };

    const parsedSportName = parseField(sportName) || "Missing Sport";
    const parsedOrganization = parseField(organization) || "Missing Org";
    const parsedAgeGroups = parseField(ageGroups) || "Missing Age";
    const parsedRegistrationUrl = parseField(registrationUrl) || "Missing URL";

    const db = await getDb();
    
    // 3. Insert into database (isActive = false so it's pending review)
    await db.insert(sportsPrograms).values({
      submitterName: parseField(submitterName) || "Unknown",
      submitterEmail: parseField(submitterEmail) || "Unknown",
      submitterPhone: parseField(submitterPhone) || "Unknown",
      sportName: parsedSportName,
      organization: parsedOrganization,
      townArea: parseField(townArea) || "Unknown",
      ageGroups: parsedAgeGroups,
      registrationUrl: parsedRegistrationUrl,
      websiteUrl: parseField(websiteUrl) || null,
      notes: parseField(notes) ? parseField(notes) : JSON.stringify(data).substring(0, 500),
      isActive: false, // Must be manually activated in Admin
    });

    console.log("[Webhook] Successfully inserted pending program (Permissive):", parsedSportName);
    return res.status(200).json({ success: true, message: "Program submitted successfully." });

  } catch (err: any) {
    console.error("[Webhook] Error processing submission:", err);
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
}
