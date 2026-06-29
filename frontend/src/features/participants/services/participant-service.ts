import { baseApi, routes } from "@/common/api";
import type { Participant, ApplyToEventPayload, CancelRegistrationPayload, ListParticipantsResponse } from "@/common/types";
import type { ApiResponse } from "@/common/types";

const participantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyToEvent: builder.mutation<ApiResponse<Participant>, { eventId: string; data: ApplyToEventPayload }>({
      query: ({ eventId, data }) => ({ url: routes.participants.apply(eventId), method: "POST", body: data }),
      invalidatesTags: ["Participants"],
    }),
    listParticipants: builder.query<ListParticipantsResponse, string>({
      query: (eventId) => routes.participants.list(eventId),
      providesTags: ["Participants"],
    }),
    cancelParticipant: builder.mutation<ApiResponse<Participant>, { eventId: string; participantId: string; data: CancelRegistrationPayload }>({
      query: ({ eventId, participantId, data }) => ({ url: routes.participants.cancel(eventId, participantId), method: "DELETE", body: data }),
      invalidatesTags: ["Participants"],
    }),
  }),
});

export const { useApplyToEventMutation, useListParticipantsQuery, useCancelParticipantMutation } = participantsApi;
