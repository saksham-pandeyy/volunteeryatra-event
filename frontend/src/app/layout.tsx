"use client";

import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store";
import "@/styles/globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className="bg-background text-foreground antialiased font-sans">
        <Provider store={store}>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "var(--color-surface-elevated)",
                border: "1px solid var(--color-surface-border)",
                color: "var(--color-foreground)",
                fontSize: "13px",
              },
            }}
          />
        </Provider>
      </body>
    </html>
  );
}
