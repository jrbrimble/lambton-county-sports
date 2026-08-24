import type { Request, Response } from "express";
import {
  createProgramChange,
  getProgramsForCronCheck,
  updateCronLastRun,
  updateProgram,
} from "./db.js";
import { notifyOwner } from "./_core/notification.js";
import { ENV } from "./_core/env.js";

const TRACKED_FIELDS = [
  "registrationOpenDate",
  "registrationCloseDate",
  "programStartDate",
] as const;

type TrackedField = (typeof TRACKED_FIELDS)[number];

function formatDateValue(val: Date | null | undefined): string {
  if (!val) return "";
  return new Date(val).toISOString();
}

function extractDatesFromText(text: string): {
  registrationOpenDate?: string;
  registrationCloseDate?: string;
  programStartDate?: string;
} {
  const result: Record<string, string> = {};

  const openPattern =
    /(?:registration\s+opens?|register\s+(?:now|today|starting)|open(?:s|ing)?\s+(?:for\s+)?registration)[^\n\r.]*?(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/i;
  const closePattern =
    /(?:registration\s+(?:closes?|deadline|ends?)|deadline\s+(?:to\s+register|for\s+registration))[^\n\r.]*?(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/i;
  const startPattern =
    /(?:program\s+starts?|season\s+(?:starts?|begins?)|first\s+(?:game|practice|session))[^\n\r.]*?(\d{4}-\d{2}-\d{2}|\w+\s+\d{1,2},?\s+\d{4})/i;

  const openMatch = openPattern.exec(text);
  if (openMatch?.[1]) {
    const d = new Date(openMatch[1]);
    if (!isNaN(d.getTime())) result.registrationOpenDate = d.toISOString();
  }

  const closeMatch = closePattern.exec(text);
  if (closeMatch?.[1]) {
    const d = new Date(closeMatch[1]);
    if (!isNaN(d.getTime())) result.registrationCloseDate = d.toISOString();
  }

  const startMatch = startPattern.exec(text);
  if (startMatch?.[1]) {
    const d = new Date(startMatch[1]);
    if (!isNaN(d.getTime())) result.programStartDate = d.toISOString();
  }

  return result;
}

export async function runMonthlyUrlCheck() {
  const programs = await getProgramsForCronCheck();
  const changesDetected: {
    programId: number;
    programName: string;
    field: string;
    oldVal: string;
    newVal: string;
  }[] = [];

  const fetchPromises = programs.map(async program => {
    try {
      if (!program.registrationUrl) return;
      const response = await fetch(program.registrationUrl, {
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "LambtonCountySportsBot/1.0" },
      });
      if (!response.ok) return;

      const text = await response.text();
      const extracted = extractDatesFromText(text);

      for (const field of TRACKED_FIELDS) {
        const extractedVal = extracted[field];
        if (!extractedVal) continue;

        const storedVal = formatDateValue(program[field]);
        const extractedNorm = new Date(extractedVal)
          .toISOString()
          .slice(0, 10);
        const storedNorm = storedVal
          ? new Date(storedVal).toISOString().slice(0, 10)
          : "";

        if (extractedNorm !== storedNorm) {
          await createProgramChange({
            programId: program.id,
            fieldName: field,
            oldValue: storedNorm || null,
            newValue: extractedNorm,
            status: "pending",
          });
          changesDetected.push({
            programId: program.id,
            programName: program.sportName,
            field,
            oldVal: storedNorm,
            newVal: extractedNorm,
          });
        }
      }
      await updateProgram(program.id, { lastCheckedAt: new Date() });
    } catch (fetchErr) {
      console.warn(
        `[Cron] Failed to fetch ${program.registrationUrl}:`,
        fetchErr
      );
    }
  });

  await Promise.all(fetchPromises);
  await updateCronLastRun("monthly-url-check", "success");

  if (changesDetected.length > 0) {
    console.log(
      `[Cron] Detected ${changesDetected.length} changes, notifying owner...`
    );
    const lines = changesDetected.map(
      c =>
        `• ${c.programName} — ${c.field}: ${
          c.oldVal || "not set"
        } → ${c.newVal}`
    );
    await notifyOwner({
      title: `${changesDetected.length} registration date change(s) detected`,
      content: `The monthly URL check found updates that need your review:\n\n${lines.join("\n")}\n\nPlease log in to the admin panel to approve or dismiss these changes.`,
    }).catch(err => console.error("[Cron] Failed to notify owner:", err));
  } else {
    console.log("[Cron] No changes detected");
  }

  console.log(
    `[Cron] Completed: checked ${programs.length} programs, detected ${
      changesDetected.length
    } changes`
  );

  return {
    programsChecked: programs.length,
    changesDetected: changesDetected.length,
  };
}

export async function monthlyUrlCheckHandler(req: Request, res: Response) {
  try {
    // Validate cron secret — supports both Vercel cron and manual triggers
    const cronSecret =
      req.headers["x-cron-secret"] || req.headers["x-vercel-cron-signature"];
    if (!cronSecret || cronSecret !== ENV.cronSecret) {
      // Also allow Vercel's own cron invocations (they set x-vercel-cron: 1)
      const isVercelCron = req.headers["x-vercel-cron"] === "1";
      if (!isVercelCron) {
        return res
          .status(403)
          .json({ error: "Forbidden: invalid cron secret" });
      }
    }

    const result = await runMonthlyUrlCheck();

    return res.json({
      ok: true,
      ...result,
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err);
    console.error("[Cron] Fatal error:", error);
    await updateCronLastRun("monthly-url-check", "error").catch(() => {});
    return res.status(500).json({ error, timestamp: new Date().toISOString() });
  }
}
