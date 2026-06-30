import { useMemo } from "react";
import { createColumnHelper, Badge, Button, StatusDropdown } from "@/components/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { formatDate } from "@/common/utils";
import type { Event } from "@/common/types";
import { Users, Eye, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const eventHelper = createColumnHelper<Event>();

interface UseEventTableColumnsOptions {
  selectedEventId: string | null;
  onSelect: (id: string | null) => void;
  onOpen: (id: string) => void;
  onDelete: (event: Event) => void;
}

export function useEventTableColumns({
  selectedEventId,
  onSelect,
  onOpen,
  onDelete,
}: UseEventTableColumnsOptions): ColumnDef<Event, unknown>[] {
  const router = useRouter();

  return useMemo(
    () =>
      [
        eventHelper.accessor("name", { header: "Event", size: 200 }),
        eventHelper.accessor("date", {
          header: "Date",
          size: 140,
          cell: (info: any) => (
            <span className="text-sm text-[var(--color-base-600)]">{formatDate(info.getValue())}</span>
          ),
        }),
        eventHelper.accessor("location", {
          header: "Location",
          size: 140,
          cell: (info: any) => (
            <span className="text-sm text-[var(--color-base-500)] truncate block">{info.getValue() || "—"}</span>
          ),
        }),
        eventHelper.accessor("category", {
          header: "Category",
          size: 120,
          cell: (info: any) => {
            const cat = info.getValue() as string;
            return <span className="text-sm text-[var(--color-base-600)] capitalize">{cat || "other"}</span>;
          },
        }),
        eventHelper.accessor("status", {
          header: "Status",
          size: 130,
          cell: (info: any) => <StatusDropdown value={info.getValue()} eventId={info.row.original.id} />,
        }),
        eventHelper.accessor("participant_count", {
          header: "Capacity",
          size: 110,
          cell: (info: any) => (
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-[var(--color-base-400)]" />
              <span className="text-sm font-medium">{info.getValue() ?? 0}</span>
              {info.row.original.max_participants && (
                <span className="text-xs text-[var(--color-base-400)]">/ {info.row.original.max_participants}</span>
              )}
            </div>
          ),
        }),
        eventHelper.display({
          id: "actions",
          header: "",
          size: 120,
          cell: (info: any) => (
            <div className="flex items-center justify-center gap-1.5">
              <button
                className="dt-action-btn dt-action-view"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen(info.row.original.id);
                }}
                title="View event details"
              >
                <Eye size={16} strokeWidth={2} />
              </button>
              <button
                className="dt-action-btn dt-action-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/events/${info.row.original.id}/edit`);
                }}
                title="Edit event"
              >
                <Pencil size={16} strokeWidth={2} />
              </button>
              <button
                className="dt-action-btn dt-action-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(info.row.original);
                }}
                title="Delete event"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
            </div>
          ),
        }),
      ] as ColumnDef<Event, unknown>[],
    [selectedEventId, onSelect, onOpen, onDelete, router]
  );
}
