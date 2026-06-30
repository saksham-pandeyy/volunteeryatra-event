"use client";

import { useState, useEffect, useCallback } from "react";
import { notify } from "@/common/utils";
import { uploadToStorage, STORAGE_BUCKETS } from "@/common/api/supabase";
import { useUpdateProfileMutation, useUploadAvatarMutation, useRemoveAvatarMutation } from "@/features/auth/services";

export type SettingsTab = "profile" | "theme";
export type ThemeMode = "light" | "dark";

export function useSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [theme, setThemeState] = useState<ThemeMode>("light");

  // Init theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setThemeState("dark");
      document.documentElement.classList.add("dark-theme");
    }
  }, []);

  const applyTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    if (t === "dark") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", t);
    notify.success(`${t === "dark" ? "Dark" : "Light"} theme applied`);
  }, []);

  return { activeTab, setActiveTab, theme, applyTheme };
}

export function useProfileForm(user: any) {
  const [name, setName] = useState(user?.name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploadingMutation }] = useUploadAvatarMutation();
  const [removeAvatar] = useRemoveAvatarMutation();

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  // avatar_url is now a full Supabase Storage URL, no prefix needed
  const avatarSrc = user?.avatar_url || null;

  const handleSaveName = useCallback(async () => {
    if (!name.trim()) { notify.error("Name cannot be empty"); return; }
    try {
      await updateProfile({ name: name.trim() }).unwrap();
      notify.success("Name updated");
      setIsEditing(false);
    } catch {
      notify.error("Failed to update name");
    }
  }, [name, updateProfile]);

  const handleCancelEdit = useCallback(() => {
    setName(user?.name || "");
    setIsEditing(false);
  }, [user]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      notify.error("Image must be under 5MB");
      return;
    }
    setIsUploading(true);
    try {
      const publicUrl = await uploadToStorage(STORAGE_BUCKETS.avatars, file);
      await uploadAvatar({ avatar_url: publicUrl }).unwrap();
      notify.success("Photo updated");
    } catch {
      notify.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  }, [uploadAvatar]);

  const handleRemoveAvatar = useCallback(async () => {
    try {
      await removeAvatar().unwrap();
      notify.success("Photo removed");
    } catch {
      notify.error("Failed to remove photo");
    }
  }, [removeAvatar]);

  return {
    name,
    setName,
    isEditing,
    setIsEditing,
    handleCancelEdit,
    isUpdating,
    isUploading,
    avatarSrc,
    handleSaveName,
    handleAvatarUpload,
    handleRemoveAvatar,
  };
}
