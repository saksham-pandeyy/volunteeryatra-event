import { useMemo } from "react";
import { createColumnHelper, Badge, Button } from "@/components/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate, daysUntil } from "@/common/utils";
import type { Event, EventStatus } from "@/common/types";

const eventHelper = createColumnHelper<Event>();

const statusColors: Record<EventStatus, "default" | "warning" | "success"> = {
  backlog: "default",
  in_progress: "warning",
  completed: "success",
};

const statusLabels: Record<EventStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  completed: "Completed",
};

interface UseEventTableColumnsOptions {
  selectedEventId: string | null;
  onSelect: (id: string | null) => void;
  onOpen: (id: string) => void;
}

export function useEventTableColumns({
  selectedEventId,
  onSelect,
  onOpen,
}: UseEventTableColumnsOptions): ColumnDef<Event, unknown>[] {
  return useMemo(
    () =>
      [
        eventHelper.accessor("name", { header: "Event", size: 200 }),
        eventHelper.accessor("date", {
          header: "Date",
          size: 140,
          cell: (info: any) => (
            <div>
              <p className="text-sm">{formatDate(info.getValue())}</p>
              <p className="text-xs text-muted mt-0.5">
                {daysUntil(info.getValue())}
              </p>
            </div>
          ),
        }),
        eventHelper.accessor("status", {
          header: "Status",
          size: 130,
          cell: (info: any) => {
            const val = info.getValue() as EventStatus;
            return (
              <Badge variant={statusColors[val] || "default"}>
                {statusLabels[val] || val}
              </Badge>
            );
          },
        }),
        eventHelper.accessor("participant_count", {
          header: "Participants",
          size: 100,
          cell: (info: any) => (
            <span className="text-sm font-medium">
              {info.getValue() ?? 0}
            </span>
          ),
        }),
        eventHelper.display({
          id: "view",
          header: "",
          size: 100,
          cell: (info: any) => (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onOpen(info.row.original.id)}
              >
                Open
              </Button>
              <Button
                size="sm"
                variant={
                  selectedEventId === info.row.original.id
                    ? "primary"
                    : "secondary"
                }
                onClick={() => onSelect(info.row.original.id)}
              >
                {selectedEventId === info.row.original.id
                  ? "Selected"
                  : "View"}
              </Button>
            </div>
          ),
        }),
      ] as ColumnDef<Event, unknown>[],
    [selectedEventId, onSelect, onOpen]
  );
}
