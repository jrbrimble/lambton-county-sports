/**
 * Owner notification via Resend (email).
 * Falls back to console.log if RESEND_API_KEY is not set.
 */
import { ENV } from "./env.js";

type NotificationPayload = {
  title: string;
  content: string;
};

export async function notifyOwner(payload: NotificationPayload): Promise<void> {
  if (!ENV.resendApiKey || !ENV.notificationEmail) {
    console.log("[Notification] (no Resend key set, logging instead)");
    console.log(`[Notification] ${payload.title}`);
    console.log(payload.content);
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(ENV.resendApiKey);
    await resend.emails.send({
      from: "Lambton County Sports <notifications@lambtoncountysports.ca>",
      to: [ENV.notificationEmail],
      subject: payload.title,
      text: payload.content,
    });
    console.log("[Notification] Email sent via Resend");
  } catch (err) {
    console.error("[Notification] Failed to send email:", err);
    // Don't throw — notification failure should not break the cron job
  }
}
