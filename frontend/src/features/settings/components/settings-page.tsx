"use client";

import { useRef } from "react";
import { SetPageMeta } from "@/components/layouts/page-meta-context";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/features/auth/hooks";
import { useSettings, useProfileForm } from "../hooks/use-settings";
import type { SettingsTab } from "../hooks/use-settings";
import { Camera, Trash2, Moon, Sun, Check } from "lucide-react";

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profile" },
  { id: "theme", label: "Theme" },
];

export function SettingsPage() {
  const { user } = useAuth();
  const { activeTab, setActiveTab, theme, applyTheme } = useSettings();

  return (
    <>
      <SetPageMeta title="Settings" />
      <div className="page-container max-w-3xl page-enter">
        <div className="flex gap-1 mb-8 border-b border-surface-border pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium transition-all cursor-pointer border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-muted border-transparent hover:text-foreground hover:border-surface-border"
              }`}
              style={{ background: "none" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" ? (
          <ProfileTab user={user} />
        ) : (
          <ThemeTab currentTheme={theme} onApplyTheme={applyTheme} />
        )}
      </div>
    </>
  );
}

function ProfileTab({ user }: { user: any }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    name, setName, isUpdating, isUploading, avatarSrc,
    handleSaveName, handleAvatarUpload, handleRemoveAvatar,
  } = useProfileForm(user);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <div className="h-20 w-20 rounded-full overflow-hidden ring-2 ring-primary/20 ring-offset-2 ring-offset-surface bg-surface-hover flex items-center justify-center">
            {avatarSrc ? (
              <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-foreground">{user?.name?.charAt(0)?.toUpperCase() || "U"}</span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center shadow hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Camera size={12} strokeWidth={2.5} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{user?.name || "User"}</p>
          <p className="text-xs text-muted">{user?.email || ""}</p>
          {avatarSrc && (
            <button onClick={handleRemoveAvatar} className="text-xs text-muted hover:text-danger mt-1 transition-colors cursor-pointer" style={{ background: "none", border: "none", padding: 0 }}>
              <Trash2 size={12} className="inline mr-1" />Remove photo
            </button>
          )}
        </div>
      </div>

      <div className="max-w-md space-y-4">
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        <Input label="Email" value={user?.email || ""} disabled className="opacity-60 cursor-not-allowed" />
        <p className="text-xs text-muted -mt-2">Email cannot be changed</p>
        <Button loading={isUpdating} disabled={!name.trim() || name === user?.name} onClick={handleSaveName}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

function ThemeTab({ currentTheme, onApplyTheme }: { currentTheme: "light" | "dark"; onApplyTheme: (t: "light" | "dark") => void }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 max-w-md">
        <button
          onClick={() => onApplyTheme("light")}
          className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer text-left ${
            currentTheme === "light" ? "border-primary bg-primary/5" : "border-surface-border hover:border-muted"
          }`}
          style={{ background: currentTheme === "light" ? "var(--color-primary-muted)" : "var(--color-surface)" }}
        >
          {currentTheme === "light" && (
            <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
          <Sun size={24} className="text-amber-500 mb-2" />
          <p className="text-sm font-semibold text-foreground">Light</p>
          <p className="text-xs text-muted mt-1">Clean and bright</p>
        </button>

        <button
          onClick={() => onApplyTheme("dark")}
          className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer text-left ${
            currentTheme === "dark" ? "border-primary bg-primary/5" : "border-surface-border hover:border-muted"
          }`}
          style={{ background: currentTheme === "dark" ? "rgba(105,104,247,0.08)" : "var(--color-surface)" }}
        >
          {currentTheme === "dark" && (
            <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check size={12} className="text-white" />
            </div>
          )}
          <Moon size={24} className="text-indigo-400 mb-2" />
          <p className="text-sm font-semibold text-foreground">Dark</p>
          <p className="text-xs text-muted mt-1">Easy on the eyes</p>
        </button>
      </div>
    </div>
  );
}
