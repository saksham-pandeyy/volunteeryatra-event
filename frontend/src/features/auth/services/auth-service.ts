import { baseApi, routes, transformResponse } from "@/common/api";
import type { LoginPayload, RegisterPayload, User } from "@/common/types";
import type { ApiResponse } from "@/common/types";

interface AuthResult {
  user: User;
  token: string;
}

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResult, LoginPayload>({
      query: (body) => ({ url: routes.auth.login, method: "POST", body }),
      transformResponse: (res: ApiResponse<AuthResult>) => res.data,
    }),
    register: builder.mutation<AuthResult, RegisterPayload>({
      query: (body) => ({ url: routes.auth.register, method: "POST", body }),
      transformResponse: (res: ApiResponse<AuthResult>) => res.data,
    }),
    getMe: builder.query<User, void>({
      query: () => routes.auth.me,
      transformResponse: (res: ApiResponse<User>) => res.data,
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation<User, { name?: string }>({
      query: (body) => ({ url: routes.auth.updateProfile, method: "PATCH", body }),
      transformResponse: (res: ApiResponse<User>) => res.data,
      invalidatesTags: ["User"],
    }),
    uploadAvatar: builder.mutation<User, FormData>({
      query: (body) => ({ url: routes.auth.uploadAvatar, method: "POST", body }),
      transformResponse: (res: ApiResponse<User>) => res.data,
      invalidatesTags: ["User"],
    }),
    removeAvatar: builder.mutation<User, void>({
      query: () => ({ url: routes.auth.removeAvatar, method: "DELETE" }),
      transformResponse: (res: ApiResponse<User>) => res.data,
      invalidatesTags: ["User"],
    }),
    forgotPassword: builder.mutation<void, { email: string }>({
      query: (body) => ({ url: routes.auth.forgotPassword, method: "POST", body }),
      transformResponse: (res: ApiResponse<any>) => { res; },
    }),
    resetPassword: builder.mutation<void, { token: string; password: string }>({
      query: (body) => ({ url: routes.auth.resetPassword, method: "POST", body }),
      transformResponse: (res: ApiResponse<any>) => { res; },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation
} = authApi;
