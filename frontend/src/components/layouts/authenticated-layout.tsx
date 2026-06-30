"use client";

import type { ReactNode } from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Modal, Button, LoadingScreen } from "@/components/ui";
import { usePageMeta } from "./page-meta-context";
import { LogOut } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { title, subtitle, headerExtra, backHref } = usePageMeta();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    setNavigating(false);
  }, [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark-theme");
    } else {
      document.documentElement.classList.remove("dark-theme");
    }
  }, []);

  useEffect(() => {
    const handleStart = () => setNavigating(true);
    const handleEnd = () => setNavigating(false);
    window.addEventListener("beforeunload", handleStart);
    return () => window.removeEventListener("beforeunload", handleStart);
  }, []);

  const handleLogoutConfirm = () => {
    logout();
    router.replace("/login");
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/events")) return "Events";
    if (pathname.startsWith("/settings")) return "Settings";
    return "Volunteer Yatra";
  };

  return (
    <>
      {navigating && <LoadingScreen minimumDuration={400} />}
      <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar user={user} onLogoutClick={() => setLogoutModalOpen(true)} />

      <div className="flex flex-1 flex-col h-full overflow-hidden bg-background">
        <header 
          className="transition-all duration-300"
          style={{
            height: "72px",
            borderBottom: "1px solid var(--color-surface-border)",
            backgroundColor: "var(--color-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingLeft: "32px",
            paddingRight: "32px",
            zIndex: 10,
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-4">
            {backHref && (
              <button
                onClick={() => router.push(backHref)}
                className="flex items-center justify-center h-9 w-9 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-sm"
                style={{
                  border: "1px solid var(--color-surface-border)",
                  backgroundColor: "var(--color-background)",
                  padding: 0
                }}
                aria-label="Go back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" />
                  <path d="M12 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-semibold text-foreground tracking-tight leading-none">{title || getPageTitle()}</h1>
              {subtitle && <p className="text-xs md:text-sm text-muted mt-1 leading-none font-medium">{subtitle}</p>}
            </div>
          </div>
          {headerExtra && <div className="flex items-center gap-4">{headerExtra}</div>}
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>

      <Modal
        open={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        title="Confirm Logout"
        className="max-w-[350px]"
        confirmText="Logout"
        confirmVariant="danger"
        onConfirm={handleLogoutConfirm}
        icon={
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-muted text-danger border border-surface-border">
            <LogOut className="h-8 w-8" />
          </div>
        }
      >
        <p className="text-sm text-muted leading-relaxed">
          Are you sure you want to log out of Volunteer Yatra?
        </p>
      </Modal>
    </div>
    </>
  );
}
