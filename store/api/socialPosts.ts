import { encodePayloadWhere } from '@/utils';
import { baseApi } from './index';

export const socialPostsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET Posts LIST
    getPosts: builder.query<any, any>({
      query: (params = {}) => {
        const validLimits = [10, 20, 50];
        const limit = validLimits.includes(Number(params.limit))
          ? Number(params.limit)
          : 10;

        const page = Number(params.page) || 1;

        // Build where conditions for social posts
        const whereConditions: any[] = [];

        // Filter by community if provided
        if (params.community) {
          whereConditions.push({ community: { equals: params.community } });
        }

        const where =
          whereConditions.length > 0 ? { and: whereConditions } : {};

        return {
          url: `/api/socialPosts`,
          method: 'GET',
          params: {
            limit,
            page,
            ...(whereConditions.length > 0 && {
              where: encodePayloadWhere(where),
            }),
          },
        };
      },

      providesTags: ['SocialPosts'],
    }),
  }),

  overrideExisting: false,
});

export const { useGetPostsQuery } = socialPostsApi;
