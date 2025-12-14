// src/features/api/authApi.ts

import { baseApi } from ".";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // 1. LOGIN
    login: builder.mutation<any, { email: string; password: string }>({
      query: (body) => ({
        url: "/api/users/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User"],
    }),
    logout: builder.mutation<any, void>({
      query: () => ({
        url: "/api/users/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    // 2. REGISTER
    register: builder.mutation<any, { name: string; email: string; password: string }>({
      query: (body) => ({
        url: "/api/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    // 3. FORGOT PASSWORD
    forgotPassword: builder.mutation<any, { email: string }>({
      query: (body) => ({
        url: "/api/users/forgot-password",
        method: "POST",
        body,
      }),
    }),

    // 4. RESET PASSWORD
    resetPassword: builder.mutation<any, { token: string; password: string }>({
      query: (body) => ({
        url: "/api/users/reset-password",
        method: "POST",
        body,
      }),
    }),

    // 5. GET CURRENT USER
    me: builder.query<any, void>({
      query: () => ({
        url: "/api/users/me",
        method: "GET",
      }),
      providesTags: ["User"],
    }),

  }),

  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useMeQuery,
  useLogoutMutation,
} = authApi;
