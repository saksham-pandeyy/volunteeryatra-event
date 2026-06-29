"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SkeletonText } from "@/components/ui";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex-center min-h-screen">
      <div className="flex flex-col items-center gap-2">
        <SkeletonText className="w-48" />
        <SkeletonText className="w-32" />
      </div>
    </div>
  );
}
