/**
 * Supabase Storage adapter.
 * Replaces the Manus Forge storage with Supabase Storage.
 */
import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env.js";

const BUCKET = "ad-images";

function getStorageClient() {
  if (!ENV.supabaseUrl || !ENV.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars are required for storage");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseServiceRoleKey).storage;
}

function appendHashSuffix(key: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = key.lastIndexOf(".");
  if (lastDot === -1) return `${key}_${hash}`;
  return `${key.slice(0, lastDot)}_${hash}${key.slice(lastDot)}`;
}

/** Upload a file to Supabase Storage and return its public URL. */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const storage = getStorageClient();
  const key = appendHashSuffix(relKey.replace(/^\/+/, ""));

  const { error } = await storage.from(BUCKET).upload(key, data, {
    contentType,
    upsert: false,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = storage.from(BUCKET).getPublicUrl(key);
  return { key, url: urlData.publicUrl };
}

/** Get the public URL for an existing key (no upload). */
export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const storage = getStorageClient();
  const key = relKey.replace(/^\/+/, "");
  const { data } = storage.from(BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}
