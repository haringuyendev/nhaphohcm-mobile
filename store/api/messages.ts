// store/api/messages.ts

import { User } from "@/types";
import { baseApi } from ".";

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMessage: builder.mutation<
      any,
      { conversation: string; text: string; sender: User }
    >({
      query: (body) => {
        return {
          url: "/api/messages",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Messages", "Conversations"],
    }),
  }),
});

export const { useCreateMessageMutation } = messagesApi;
