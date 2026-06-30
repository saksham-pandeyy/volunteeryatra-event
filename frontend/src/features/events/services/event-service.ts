import { baseApi, routes, transformResponse } from "@/common/api";
import type { Event, EventStatus, CreateEventPayload, UpdateEventPayload, EventFilters, EventListStats, DashboardStats, PaginatedResult } from "@/common/types";
import type { ApiResponse } from "@/common/types";

const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<PaginatedResult<Event>, EventFilters>({
      query: (params) => ({ url: routes.events.list, params }),
      transformResponse: (res: ApiResponse<Event[]> & { pagination: { total: number; page: number; limit: number; pages: number } }) => ({
        data: res.data,
        pagination: res.pagination || { total: 0, page: 1, limit: 10, pages: 0 },
      }),
      providesTags: ["Events"],
    }),
    getEvent: builder.query<Event, string>({
      query: (eventId) => routes.events.byId(eventId),
      transformResponse: (res: ApiResponse<Event>) => res.data,
      providesTags: (_r, _e, eventId) => [{ type: "Event", id: eventId }],
    }),
    createEvent: builder.mutation<Event, CreateEventPayload>({
      query: (body) => ({ url: routes.events.create, method: "POST", body }),
      transformResponse: (res: ApiResponse<Event>) => res.data,
      invalidatesTags: ["Events", "DashboardStats"],
    }),
    updateEvent: builder.mutation<Event, { eventId: string; data: UpdateEventPayload }>({
      query: ({ eventId, data }) => ({ url: routes.events.update(eventId), method: "PUT", body: data }),
      transformResponse: (res: ApiResponse<Event>) => res.data,
      invalidatesTags: (_r, _e, { eventId }) => ["Events", { type: "Event", id: eventId }, "DashboardStats"],
    }),
    updateEventStatus: builder.mutation<Event, { eventId: string; status: EventStatus }>({
      query: ({ eventId, status }) => ({ url: routes.events.updateStatus(eventId), method: "PATCH", body: { status } }),
      transformResponse: (res: ApiResponse<Event>) => res.data,
      invalidatesTags: (_r, _e, { eventId }) => ["Events", { type: "Event", id: eventId }, "DashboardStats"],
    }),
    deleteEvent: builder.mutation<void, string>({
      query: (eventId) => ({ url: routes.events.delete(eventId), method: "DELETE" }),
      transformResponse: (res: ApiResponse<null>) => { res; },
      invalidatesTags: ["Events", "DashboardStats"],
    }),
    getEventListStats: builder.query<EventListStats, void>({
      query: () => routes.events.listStats,
      transformResponse: (res: ApiResponse<EventListStats>) => res.data,
      providesTags: ["Events"],
    }),
    getDashboardStats: builder.query<DashboardStats, { from?: string; to?: string }>({
      query: (params) => ({ url: routes.events.stats, params }),
      transformResponse: (res: ApiResponse<DashboardStats>) => res.data,
      providesTags: ["DashboardStats"],
    }),
  }),
});

export const { useListEventsQuery, useGetEventQuery, useCreateEventMutation, useUpdateEventMutation, useUpdateEventStatusMutation, useDeleteEventMutation, useGetEventListStatsQuery, useGetDashboardStatsQuery } = eventsApi;
