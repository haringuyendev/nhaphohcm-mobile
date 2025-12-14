import { Property } from "@/types";
import { baseApi } from "./index";
import { buildWhereFromParams, buildWhereFromStatus, encodePayloadWhere, encodeWhere } from "@/utils";

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET LIST
    getProperties: builder.query<any, any>({
      query: (params = {}) => {
        const validLimits = [10, 20, 50];
        const limit = validLimits.includes(Number(params.limit))
          ? Number(params.limit)
          : 10;

        const page = Number(params.page) || 1;

        const where = buildWhereFromParams(params);

        return {
          url: `/api/properties`,
          method: "GET",
          params: {
            limit,
            page,
            where: encodePayloadWhere(where),
            sort: "-is_vip,-bumped_at,-created_at",
          },
        };
      },

      providesTags: ["Properties"],
    }),

    getPropertiesByStatus: builder.query<any, any>({
      query: (params) => {
        const limit = [10, 20, 50].includes(Number(params.limit))
          ? Number(params.limit)
          : 10;

        const page = Number(params.page) || 1;

        const where = buildWhereFromStatus(params);

        return {
          url: "/api/properties",
          method: "GET",
          params: {
            limit,
            page,
            sort: "-is_vip,-bumped_at,-created_at",
            depth: 2,
            where: encodeWhere(where),
          },
        };
      },

      providesTags: ["Properties"],
    }),

    // GET BY ID
    getPropertyById: builder.query<Property, string>({
      query: (id: string) => `/api/properties/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Properties", id }],
    }),

    // CREATE
    createProperty: builder.mutation<Property, Property>({
      query: (data: Property) => ({
        url: "/api/properties",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Properties"],
    }),

    // UPDATE
    updateProperty: builder.mutation<Property, { id: string; data: Partial<Property> }>({
      query: ({ id, data }) => ({
        url: `/api/properties/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Properties",
        { type: "Properties", id },
      ],
    }),

    // DELETE
    deleteProperty: builder.mutation<{ success: boolean }, string>({
      query: (id: string) => ({
        url: `/api/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Properties"],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useGetPropertiesByStatusQuery,
} = propertiesApi;
