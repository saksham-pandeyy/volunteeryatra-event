"use client";

import { useState, useRef, useCallback } from "react";
import { notify } from "@/common/utils";
import { uploadToStorage, STORAGE_BUCKETS } from "@/common/api/supabase";

interface UseCoverUploadOptions {
  initialUrl?: string | null;
  onUrlChange: (url: string) => void;
}

export function useCoverUpload({ initialUrl, onUrlChange }: UseCoverUploadOptions) {
  const [preview, setPreview] = useState<string | null>(initialUrl || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify.error("Image must be under 5MB");
      return;
    }
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const publicUrl = await uploadToStorage(STORAGE_BUCKETS.covers, file);
      onUrlChange(publicUrl);
      notify.success("Cover image uploaded");
    } catch {
      notify.error("Failed to upload cover image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }, [onUrlChange]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    onUrlChange("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onUrlChange]);

  return { preview, setPreview, uploading, fileInputRef, handleSelect, handleRemove };
}
