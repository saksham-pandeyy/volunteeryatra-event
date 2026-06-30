"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { LayoutDashboard, Calendar, Settings, LogOut } from "lucide-react";

interface SidebarProps {
  user: any;
  onLogoutClick: () => void;
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/events", label: "Events", icon: <Calendar className="h-5 w-5" /> },
  { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export function Sidebar({ user, onLogoutClick }: SidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/events" ? pathname.startsWith("/events") :
    href === "/settings" ? pathname.startsWith("/settings") :
    pathname.startsWith(href);

  // avatar_url is now a full Supabase Storage URL, no prefix needed
  const avatarSrc = user?.avatar_url || null;

  return (
    <aside
      className="sidebar-dark"
      style={{
        width: "260px",
        height: "100vh",
        backgroundColor: "var(--color-surface)",
        color: "var(--color-foreground)",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}      >
      <div
        style={{
          height: "64px",
          display: "flex",
          alignItems: "center",
          paddingLeft: "20px",
          paddingRight: "20px",
          borderBottom: "1px solid var(--color-surface-border)",
        }}
      >
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center" }}>
          <img
            src="/Logo.png"
            alt="Volunteer Yatra Logo"
            style={{ height: "28px", width: "auto", objectFit: "contain", filter: "invert(1) brightness(10)" }}
          />
        </Link>
      </div>

      <nav style={{ flex: 1, padding: "24px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all no-underline",
                active
                  ? "bg-surface-active text-foreground"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <span className={clsx("flex items-center", active && "text-primary")}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        style={{
          borderTop: "1px solid var(--color-surface-border)",
          padding: "14px 16px",
          backgroundColor: "var(--color-background)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            height: "38px",
            width: "38px",
            borderRadius: "50%",
            overflow: "hidden",
            backgroundColor: "var(--color-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
          ) : (
            <span style={{ fontSize: "15px", fontWeight: "bold", color: "#ffffff" }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: "13px", fontWeight: 600, color: "var(--color-foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.name || "User"}
          </p>
          <p style={{ margin: 0, fontSize: "11px", color: "var(--color-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user?.email || ""}
          </p>
        </div>

        <button
          onClick={onLogoutClick}
          className="cursor-pointer transition-all"
          style={{
            background: "none",
            border: "none",
            color: "var(--color-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "6px",
            borderRadius: "6px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-surface-hover)";
            e.currentTarget.style.color = "var(--color-danger)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-muted)";
          }}
          title="Sign Out"
        >
          <LogOut size={16} strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
}
