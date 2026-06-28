import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      "@tanstack/react-table",
      "recharts",
      "sonner",
      "lucide-react",
    ],
  },
};

export default nextConfig;
