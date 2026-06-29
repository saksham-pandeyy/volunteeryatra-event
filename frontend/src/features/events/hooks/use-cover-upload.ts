"use client";

import { useState, useRef, useCallback } from "react";
import { notify } from "@/common/utils";

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
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/upload`,
        { method: "POST", body: formData }
      );
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      onUrlChange(data.url);
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
