"use client";

import type { ReactNode } from "react";
import { PageMetaProvider } from "@/components/layouts/page-meta-context";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";

export default function AuthenticatedRootLayout({ children }: { children: ReactNode }) {
  return (
    <PageMetaProvider>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </PageMetaProvider>
  );
}
