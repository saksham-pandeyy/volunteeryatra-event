import { baseApi, routes } from "@/common/api";
import type { Event, EventStatus, CreateEventPayload, UpdateEventPayload, EventFilters, ListEventsResponse, DashboardStats } from "@/common/types";
import type { ApiResponse } from "@/common/types";

const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<ListEventsResponse, EventFilters>({
      query: (params) => ({ url: routes.events.list, params }),
      providesTags: ["Events"],
    }),
    getEvent: builder.query<ApiResponse<Event>, string>({
      query: (eventId) => routes.events.byId(eventId),
      providesTags: (_r, _e, eventId) => [{ type: "Event", id: eventId }],
    }),
    createEvent: builder.mutation<ApiResponse<Event>, CreateEventPayload>({
      query: (body) => ({ url: routes.events.create, method: "POST", body }),
      invalidatesTags: ["Events", "DashboardStats"],
    }),
    updateEvent: builder.mutation<ApiResponse<Event>, { eventId: string; data: UpdateEventPayload }>({
      query: ({ eventId, data }) => ({ url: routes.events.update(eventId), method: "PUT", body: data }),
      invalidatesTags: (_r, _e, { eventId }) => ["Events", { type: "Event", id: eventId }, "DashboardStats"],
    }),
    updateEventStatus: builder.mutation<ApiResponse<Event>, { eventId: string; status: EventStatus }>({
      query: ({ eventId, status }) => ({ url: routes.events.updateStatus(eventId), method: "PATCH", body: { status } }),
      invalidatesTags: (_r, _e, { eventId }) => ["Events", { type: "Event", id: eventId }, "DashboardStats"],
    }),
    deleteEvent: builder.mutation<ApiResponse<null>, string>({
      query: (eventId) => ({ url: routes.events.delete(eventId), method: "DELETE" }),
      invalidatesTags: ["Events", "DashboardStats"],
    }),
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => routes.events.stats,
      providesTags: ["DashboardStats"],
    }),
  }),
});

export const { useListEventsQuery, useGetEventQuery, useCreateEventMutation, useUpdateEventMutation, useUpdateEventStatusMutation, useDeleteEventMutation, useGetDashboardStatsQuery } = eventsApi;
