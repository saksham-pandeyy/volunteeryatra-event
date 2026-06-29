"use client";

import { useState, useRef } from "react";
import { notify } from "@/common/utils";
import { Modal, Button, Input } from "@/components/ui";
import { useUpdateProfileMutation, useUploadAvatarMutation, useRemoveAvatarMutation } from "@/features/auth/services";
import type { User } from "@/common/types";
import { Camera, Trash2 } from "lucide-react";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function ProfileModal({ open, onClose, user }: ProfileModalProps) {
  const [name, setName] = useState(user?.name || "");
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar] = useRemoveAvatarMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveName = async () => {
    if (!name.trim() || name === user?.name) {
      onClose();
      return;
    }
    try {
      await updateProfile({ name: name.trim() }).unwrap();
      notify.success("Name updated successfully");
      onClose();
    } catch {
      notify.error("Failed to update name");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await uploadAvatar(formData).unwrap();
      notify.success("Profile photo updated");
    } catch {
      notify.error("Failed to upload photo");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await removeAvatar().unwrap();
      notify.success("Profile photo removed");
    } catch {
      notify.error("Failed to remove photo");
    }
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";
  const avatarSrc = user?.avatar_url ? `${apiUrl}${user.avatar_url}` : null;

  return (
    <Modal open={open} onClose={onClose} title="Profile Settings">
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative group">
            <div className="h-24 w-24 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-surface bg-surface-hover flex items-center justify-center">
              {avatarSrc ? (
                <img src={avatarSrc} alt={user?.name || "Avatar"} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:bg-primary-hover transition-colors cursor-pointer"
              title="Change photo"
            >
              <Camera size={14} strokeWidth={2.5} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarUpload}
              disabled={isUploading}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {user?.name || "User"}
            </span>
            {avatarSrc && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="text-muted hover:text-danger transition-colors cursor-pointer"
                title="Remove photo"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Name Field */}
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
        />

        {/* Email (read-only) */}
        <div className="form-field">
          <label className="text-label">Email Address</label>
          <div className="form-input w-full bg-surface-hover text-muted cursor-not-allowed flex items-center" style={{ borderRadius: "8px" }}>
            <span className="px-1">{user?.email || "—"}</span>
          </div>
          <p className="text-xs text-muted mt-1">Email cannot be changed</p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            loading={isUpdating} 
            disabled={!name.trim() || name === user?.name}
            onClick={handleSaveName}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
}
