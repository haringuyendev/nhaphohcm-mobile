import { generatePayloadQuery } from "@/utils";
import { baseApi } from "./index";

export const socialPostsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET LIST
    getMyFeed: builder.query<any, any>({
      query: ({ limit = 10, page = 1 }) =>
        `/api/socialPosts/my-feed?limit=${limit}&page=${page}`,
      providesTags: ["SocialPosts"],
    }),
    getTrending: builder.query<any, any>({
      query: ({ limit = 10, page = 1 }) =>
        `/api/socialPosts/trending?limit=${limit}&page=${page}`,
      providesTags: ["SocialPosts"],
    }),
    getPostLikes: builder.query<any, any>({
      query: (params = {}) => {
        const where = {
          user: {
            equals: params.userId
          }
        };

        return generatePayloadQuery({
          path: "/api/postLikes",
          where,
        });
      },
      providesTags: ["PostLikes"],
    }),
    toggleLike: builder.mutation<
      { success: boolean; liked: boolean; likeCount: number },
      string // postId
    >({
      query: (postId) => ({
        url: `/api/postLikes/toggle`, // ← Đúng endpoint
        method: "POST",
        body: { post: postId },
      }),
      invalidatesTags: ["SocialPosts", "PostLikes"],
    }),

    getComments: builder.query<any, any>({
      query: (postId, limit = 10, page = 1) =>
        `/api/comments/post/${postId}?limit=${limit}&page=${page}`,
      providesTags: ["Comments"],
    }),

    // Thêm comment mới cho bài viết
    addComment: builder.mutation<
      { success: boolean; comment: any },
      { postId: string; text: string }
    >({
      query: ({ postId, text }) => ({
        url: `/api/comments/add`,
        method: "POST",
        body: {
          post: postId,
          text,
        },
      }),
      invalidatesTags: ["Comments"],
    }),

    // Trả lời một comment (reply)
    replyComment: builder.mutation<
      { success: boolean; comment: any },
      { parentCommentId: string; text: string }
    >({
      query: ({ parentCommentId, text }) => ({
        url: `/api/comments/reply`,
        method: "POST",
        body: {
          parentComment: parentCommentId,
          text,
        },
      }),
      invalidatesTags: ["Comments"],
    }),
  }),
});

export const {
  useGetMyFeedQuery,
  useGetTrendingQuery,
  useGetPostLikesQuery,
  useToggleLikeMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
  useReplyCommentMutation,
} = socialPostsApi;
