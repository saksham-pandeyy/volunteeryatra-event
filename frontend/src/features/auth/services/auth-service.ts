import { baseApi, routes } from "@/common/api";
import type { AuthResponse, LoginPayload, RegisterPayload, User, ApiResponse } from "@/common/types";

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginPayload>({ query: (body) => ({ url: routes.auth.login, method: "POST", body }) }),
    register: builder.mutation<AuthResponse, RegisterPayload>({ query: (body) => ({ url: routes.auth.register, method: "POST", body }) }),
    getMe: builder.query<ApiResponse<User>, void>({ query: () => routes.auth.me, providesTags: ["User"] }),
    forgotPassword: builder.mutation<ApiResponse<any>, { email: string }>({ query: (body) => ({ url: routes.auth.forgotPassword, method: "POST", body }) }),
    resetPassword: builder.mutation<ApiResponse<any>, { token: string; password: string }>({ query: (body) => ({ url: routes.auth.resetPassword, method: "POST", body }) }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetMeQuery, useForgotPasswordMutation, useResetPasswordMutation } = authApi;
