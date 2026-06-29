import { useCallback } from "react";
import { notify } from "@/common/utils";
import { useDeleteEventMutation } from "../services";

export function useDeleteEvent() {
  const [deleteEvent, { isLoading }] = useDeleteEventMutation();

  const handleDelete = useCallback(async (eventId: string) => {
    try {
      await deleteEvent(eventId).unwrap();
      notify.success("Event deleted successfully");
    } catch {
      notify.error("Failed to delete event");
    }
  }, [deleteEvent]);

  return { handleDelete, deleteLoading: isLoading };
}
