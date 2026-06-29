"use client";

import type { ReactNode } from "react";
import { GuestLayout } from "@/components/layouts/guest-layout";

export default function GuestRootLayout({ children }: { children: ReactNode }) {
  return <GuestLayout>{children}</GuestLayout>;
}
