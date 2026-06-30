"use client";

import React, { useRef } from "react";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks";
import { useSettings, useProfileForm } from "../hooks/use-settings";
import { Camera, Trash2, Moon, Sun, Check, User, Palette } from "lucide-react";

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, applyTheme } = useSettings();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
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
  } = useProfileForm(user);

  return (
    <>
      <SetPageMeta title="Settings" />
      <div className="page-container max-w-5xl space-y-6 pb-12 page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-surface p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <User size={18} className="text-primary" />
                <h2 className="text-base font-bold text-foreground">Profile Details</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-surface-border/50">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-primary/10 ring-offset-4 ring-offset-surface bg-surface-hover flex items-center justify-center transition-transform group-hover:scale-105 duration-200">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-foreground">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow hover:bg-primary-hover hover:scale-110 transition-all cursor-pointer"
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
                
                <div className="text-center sm:text-left space-y-2">
                  <div>
                    <p className="text-base font-bold text-foreground">{user?.name || "User"}</p>
                    <p className="text-xs text-muted mt-0.5">{user?.email || ""}</p>
                  </div>
                  {avatarSrc && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 text-xs text-danger hover:text-danger-hover border border-danger/20 hover:border-danger bg-danger/5 hover:bg-danger/10 px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 size={12} /> Remove photo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  disabled={!isEditing}
                />
                <div>
                  <Input
                    label="Email Address"
                    value={user?.email || ""}
                    disabled
                    className="opacity-60 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-muted mt-1.5 ml-1">Email address cannot be changed</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                {isEditing ? (
                  <>
                    <Button
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      Cancel
                    </Button>
                    <Button
                      loading={isUpdating}
                      disabled={!name.trim() || name === user?.name}
                      onClick={handleSaveName}
                      className="px-6"
                    >
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="px-6"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Theme Column */}
          <div className="space-y-6">
            <div className="card-surface p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-surface-border pb-3">
                <Palette size={18} className="text-primary" />
                <h2 className="text-base font-bold text-foreground">Theme Settings</h2>
              </div>

              <div className="flex flex-col gap-4">
                {/* Light Theme Button */}
                <button
                  onClick={() => applyTheme("light")}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    theme === "light" 
                      ? "border-primary bg-primary/5 dark:bg-primary/5" 
                      : "border-surface-border hover:border-muted bg-surface"
                  }`}
                  style={{
                    background: theme === "light" ? "var(--color-primary-muted)" : "var(--color-surface)"
                  }}
                >
                  {theme === "light" && (
                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Sun size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Light Theme</p>
                    <p className="text-xs text-muted mt-0.5">Clean and bright view</p>
                  </div>
                </button>

                {/* Dark Theme Button */}
                <button
                  onClick={() => applyTheme("dark")}
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                    theme === "dark" 
                      ? "border-primary bg-primary/5 dark:bg-primary/5" 
                      : "border-surface-border hover:border-muted bg-surface"
                  }`}
                  style={{
                    background: theme === "dark" ? "rgba(105,104,247,0.08)" : "var(--color-surface)"
                  }}
                >
                  {theme === "dark" && (
                    <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check size={12} className="text-white" />
                    </div>
                  )}
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                    <Moon size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Dark Theme</p>
                    <p className="text-xs text-muted mt-0.5">Easy on the eyes in low light</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
