import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseStorageUrl = supabaseUrl
  ? `${supabaseUrl}/storage/v1/object/public`
  : "";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const STORAGE_BUCKETS = {
  covers: "covers",
  avatars: "avatars",
} as const;

/**
 * Upload file via the backend proxy (uses service role key to bypass RLS).
 * Backend returns a relative path; frontend constructs the full public URL
 * using NEXT_PUBLIC_SUPABASE_URL so the raw Supabase URL never appears in API responses.
 */
export async function uploadToStorage(
  bucket: string,
  file: File
): Promise<string> {
  if (!supabaseStorageUrl) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL in your .env.local"
    );
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const formData = new FormData();
  formData.append("file", file);

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
  const res = await fetch(`${apiUrl}/upload?bucket=${bucket}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || "Upload failed");
  }

  const resData = await res.json();
  // Backend returns { path: "covers/filename.jpg" } — construct full URL on frontend
  return `${supabaseStorageUrl}/${resData.data.path}`;
}

export async function deleteFromStorage(publicUrl: string): Promise<void> {
  if (!supabase) return;
  const parts = publicUrl.split("/object/public/");
  if (parts.length < 2) return;

  const filePath = parts[1].split("/").slice(1).join("/");
  const bucket = parts[1].split("/")[0];

  await supabase.storage.from(bucket).remove([filePath]);
}
