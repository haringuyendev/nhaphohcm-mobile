import { buildWhereFromParams, encodePayloadWhere } from '@/utils';
import { Community } from '../payload-types';
import { baseApi } from './index';

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET LIST
    getCommunities: builder.query<any, any>({
      query: (params = {}) => {
        const validLimits = [10, 20, 50];
        const limit = validLimits.includes(Number(params.limit))
          ? Number(params.limit)
          : 10;

        const page = Number(params.page) || 1;

        const where = buildWhereFromParams(params);

        return {
          url: `/api/communities`,
          method: 'GET',
          params: {
            limit,
            page,
            where: encodePayloadWhere(where),
          },
        };
      },

      providesTags: ['Communities'],
    }),

    // GET BY ID
    getCommunityById: builder.query<any, string>({
      query: (id: string) => `/api/c/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Properties', id }],
    }),

    // CREATE
    createCommunity: builder.mutation<Community, Community>({
      query: (data: Community) => ({
        url: '/api/communities',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Communities'],
    }),

    // UPDATE
    updateCommunity: builder.mutation<
      Community,
      { id: string; data: Partial<Community> }
    >({
      query: ({ id, data }) => ({
        url: `/api/communities/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Communities',
        { type: 'Communities', id },
      ],
    }),

    // DELETE
    deleteCommunity: builder.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/api/communities/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Communities'],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetCommunitiesQuery,
  useGetCommunityByIdQuery,
  useCreateCommunityMutation,
  useUpdateCommunityMutation,
  useDeleteCommunityMutation,
} = propertiesApi;
