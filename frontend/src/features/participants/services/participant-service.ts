import { baseApi, routes, transformResponse } from "@/common/api";
import type { Participant, ApplyToEventPayload, CancelRegistrationPayload } from "@/common/types";
import type { ApiResponse } from "@/common/types";

const participantsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    applyToEvent: builder.mutation<Participant, { eventId: string; data: ApplyToEventPayload }>({
      query: ({ eventId, data }) => ({ url: routes.participants.apply(eventId), method: "POST", body: data }),
      transformResponse: (res: ApiResponse<Participant>) => res.data,
      invalidatesTags: ["Participants"],
    }),
    listParticipants: builder.query<Participant[], string>({
      query: (eventId) => routes.participants.list(eventId),
      transformResponse: (res: ApiResponse<Participant[]>) => res.data,
      providesTags: ["Participants"],
    }),
    cancelParticipant: builder.mutation<Participant, { eventId: string; participantId: string; data: CancelRegistrationPayload }>({
      query: ({ eventId, participantId, data }) => ({ url: routes.participants.cancel(eventId, participantId), method: "DELETE", body: data }),
      transformResponse: (res: ApiResponse<Participant>) => res.data,
      invalidatesTags: ["Participants"],
    }),
  }),
});

export const { useApplyToEventMutation, useListParticipantsQuery, useCancelParticipantMutation } = participantsApi;
