"use client";

import { useRouter } from "next/navigation";
import { Button } from "./button";

interface EventNotFoundProps {
  message?: string;
}

export function EventNotFound({ message = "Event not found" }: EventNotFoundProps) {
  const router = useRouter();

  return (
    <div className="flex-center flex-col gap-2 py-20">
      <p className="text-muted">{message}</p>
      <Button variant="secondary" onClick={() => router.push("/events")}>
        Back to Events
      </Button>
    </div>
  );
}
