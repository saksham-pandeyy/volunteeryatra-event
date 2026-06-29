"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Modal, Button } from "@/components/ui";
import { LogOut } from "lucide-react";

interface AuthenticatedLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerExtra?: ReactNode;
}

export function AuthenticatedLayout({ 
  children,
  title,
  subtitle,
  headerExtra
}: AuthenticatedLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    router.replace("/login");
  };

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "Dashboard";
    if (pathname.startsWith("/events")) return "Events";
    return "Volunteer Yatra";
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <Sidebar user={user} onLogoutClick={() => setLogoutModalOpen(true)} />

      <div className="flex flex-1 flex-col h-full overflow-hidden bg-background">
        <header 
          style={{
            height: "64px",
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
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight">{title || getPageTitle()}</h1>
            {subtitle && <p className="text-xs text-muted mt-0.5 leading-none">{subtitle}</p>}
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            <LogOut className="h-8 w-8" />
          </div>
        }
      >
        <p className="text-sm text-slate-500 leading-relaxed">
          Are you sure you want to log out of Volunteer Yatra?
        </p>
      </Modal>
    </div>
  );
}
