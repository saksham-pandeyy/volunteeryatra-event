"use client";

import { useCoverUpload } from "../hooks";
import { Button } from "@/components/ui";
import { Upload, X, ImageIcon } from "lucide-react";

interface CoverUploadProps {
  initialUrl?: string | null;
  onUrlChange: (url: string) => void;
  id?: string;
}

export function CoverUpload({ initialUrl, onUrlChange, id = "cover-upload" }: CoverUploadProps) {
  const { preview, uploading, fileInputRef, handleSelect, handleRemove } = useCoverUpload({
    initialUrl,
    onUrlChange,
  });

  return (
    <div className="overflow-hidden rounded-xl">
      {preview ? (
        <div className="relative h-48 sm:h-56 bg-surface-hover rounded-xl overflow-hidden group">
          <img src={preview} alt="Cover preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg backdrop-blur-sm"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/40 backdrop-blur-sm">
            <span className="text-[10px] font-semibold text-white/90">Cover Image</span>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br from-base-50 to-base-100 border-2 border-dashed border-surface-border rounded-xl hover:border-primary/50 hover:from-primary/[0.02] hover:to-primary/[0.01] transition-all cursor-pointer group"
        >
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ImageIcon size={24} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">Event Cover Image</p>
          <p className="text-xs text-muted mb-5 text-center">
            Upload a photo to make your event stand out (max 5MB)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleSelect}
            className="hidden"
            id={id}
          />
          <Button type="button" variant="secondary" size="sm" loading={uploading}>
            <Upload size={14} /> {uploading ? "Uploading..." : "Choose Image"}
          </Button>
        </div>
      )}
    </div>
  );
}
