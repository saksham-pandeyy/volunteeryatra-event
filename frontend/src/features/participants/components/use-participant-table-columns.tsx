import { useMemo } from "react";
import { createColumnHelper, Badge, Button } from "@/components/ui";
import type { ColumnDef } from "@tanstack/react-table";
import { timeAgo } from "@/common/utils";
import type { Participant } from "@/common/types";

const participantHelper = createColumnHelper<Participant>();

interface UseParticipantTableColumnsOptions {
  onCancel: (participant: Participant) => void;
}

export function useParticipantTableColumns({
  onCancel,
}: UseParticipantTableColumnsOptions): ColumnDef<Participant, unknown>[] {
  return useMemo(
    () =>
      [
        participantHelper.accessor("name", { header: "Name", size: 160 }),
        participantHelper.accessor("email", { header: "Email", size: 200 }),
        participantHelper.accessor("status", {
          header: "Status",
          size: 110,
          cell: (info: any) => {
            const s = info.getValue();
            const v =
              s === "applied"
                ? "success"
                : s === "cancelled"
                  ? "danger"
                  : "default";
            return <Badge variant={v}>{s}</Badge>;
          },
        }),
        participantHelper.accessor("created_at", {
          header: "Applied",
          size: 130,
          cell: (info: any) => (
            <span className="text-sm text-muted">
              {timeAgo(info.getValue())}
            </span>
          ),
        }),
        participantHelper.accessor("cancellation_reason", {
          header: "Reason",
          size: 180,
          cell: (info: any) => (
            <span className="text-sm text-muted">
              {info.getValue() || "\u2014"}
            </span>
          ),
        }),
        participantHelper.display({
          id: "actions",
          header: "",
          size: 100,
          cell: (info: any) =>
            info.row.original.status === "applied" ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onCancel(info.row.original)}
              >
                Cancel
              </Button>
            ) : null,
        }),
      ] as ColumnDef<Participant, unknown>[],
    [onCancel]
  );
}
