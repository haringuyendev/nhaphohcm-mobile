import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";

export const baseApi = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    credentials: "omit",

    prepareHeaders: async (headers) => {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        headers.set("Authorization", `JWT ${token}`);
      }
      return headers;
    },
  }),

  tagTypes: [
    "Auth",
    "User",
    "PropertyTypes",
    "Properties",
    "MyProperties",
    "Conversations",
    "Messages",
    "Communities",
    "Members",
    "SocialPosts",
    "Comments",
    "PostLikes",
    "Provinces",
    "Districts",
    "Media",
    "Wards",
  ],

  endpoints: () => ({}),
});
