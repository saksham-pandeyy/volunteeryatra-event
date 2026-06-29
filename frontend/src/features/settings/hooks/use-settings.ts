"use client";

import { useState, useEffect, useCallback } from "react";
import { notify } from "@/common/utils";
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
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
  const [removeAvatar] = useRemoveAvatarMutation();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";
  const avatarSrc = user?.avatar_url ? `${apiUrl}${user.avatar_url}` : null;

  const handleSaveName = useCallback(async () => {
    if (!name.trim()) { notify.error("Name cannot be empty"); return; }
    try {
      await updateProfile({ name: name.trim() }).unwrap();
      notify.success("Name updated");
    } catch {
      notify.error("Failed to update name");
    }
  }, [name, updateProfile]);

  const handleAvatarUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      await uploadAvatar(formData).unwrap();
      notify.success("Photo updated");
    } catch {
      notify.error("Failed to upload photo");
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

  return { name, setName, isUpdating, isUploading, avatarSrc, handleSaveName, handleAvatarUpload, handleRemoveAvatar };
}
