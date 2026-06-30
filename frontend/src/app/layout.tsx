"use client";

import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import { Provider } from "react-redux";
import { Toaster } from "sonner";
import { store } from "@/store";
import "@/styles/globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
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
