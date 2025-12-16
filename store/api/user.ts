// src/store/api/userApi.ts
import { User } from "@/types";
import { baseApi } from "./index";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET USER BY ID
    getUserById: builder.query<User, string>({
      query: (id) => `/api/users/${id}`,
      providesTags: (result, error, id) =>
        result ? [{ type: "User", id }] : ["User"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetUserByIdQuery,
} = userApi;
