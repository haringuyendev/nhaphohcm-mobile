import { baseApi } from ".";
import { User } from "@/types";

export const conversationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrGetConversation: builder.mutation<
      any,
      { sender: string; recipient: string }
    >({
      query: (body) => ({
        url: "/api/conversations/create-or-get",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversations"],
    }),
  }),
});

export const { useCreateOrGetConversationMutation } = conversationsApi;
