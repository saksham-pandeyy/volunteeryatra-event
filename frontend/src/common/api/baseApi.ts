import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { notify } from "@/common/utils";
import type { ApiResponse } from "@/common/types";

export function transformResponse<T>(response: ApiResponse<T>): T {
  return response.data;
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
    prepareHeaders: (headers) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
          headers.set("Authorization", `Bearer ${token}`);
        }
      }
      return headers;
    },
  }),
  tagTypes: ["Events", "Event", "Participants", "User", "DashboardStats"],
  endpoints: () => ({}),
});

export const authErrorMiddleware = (api: any) => (next: any) => (action: any) => {
  if (action?.error && action?.payload?.status === 401) {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        notify.error("Session expired. Please login again.");
        window.location.href = "/login";
      }
    }
  }
  return next(action);
};
