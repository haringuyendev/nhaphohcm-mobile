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

    toggleFavorite: builder.mutation<
      { isFavorite: boolean; favorites: string[] },
      { propertyId: string }
    >({
      query: ({ propertyId }) => ({
        url: "/api/users/toggle-favorite",
        method: "POST",
        body: { propertyId },
      }),
      invalidatesTags: ["User", "Properties"],
    })
  }),
});

export const {
  useGetUserByIdQuery,
  useToggleFavoriteMutation,
} = userApi;
