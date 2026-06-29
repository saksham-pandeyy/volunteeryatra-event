import { useParams } from "next/navigation";
import { useGetEventQuery } from "../services";

export function useEventDetail() {
  const params = useParams<{ eventId: string }>();
  const eventId = params?.eventId || "";
  const { data, isLoading, error } = useGetEventQuery(eventId, { skip: !eventId });
  const event = data?.success ? data.data : null;
  return { event, isLoading, error, eventId };
}
