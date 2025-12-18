import { Property } from "@/types";
import { baseApi } from "./index";
import {
  buildWhereFromParams,
  buildWhereFromStatus,
  generatePayloadQuery,
} from "@/utils";

export const propertiesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<any, any>({
      query: (params = {}) => {
        const validLimits = [10, 20, 50];
        const limit = validLimits.includes(Number(params.limit))
          ? Number(params.limit)
          : 10;

        const page = Number(params.page) || 1;

        const where = buildWhereFromParams(params);

        return generatePayloadQuery({
          path: "/api/properties",
          where,
          limit,
          page,
          sort: "-is_vip,-bumped_at,-created_at",
        });
      },
      providesTags: ["Properties"],
    }),

    getMyPropertiesByStatus: builder.query<
      any,
      {
        userId: string;
        status?: "published" | "deleted" | "expired";
        limit?: number;
        page?: number;
      }
    >({
      query: ({ userId, status, limit = 50, page = 1 }) => {
        const where = buildWhereFromStatus({ userId, status });

        const sort =
          status === "published" ? "-bumped_at,-created_at" : "-created_at";

        return generatePayloadQuery({
          path: "/api/properties",
          where,
          limit,
          page,
          sort,
          otherParams: {
            depth: 2, // populate relationship: images, type, district, ward...
          },
        });
      },
      providesTags: (result, error, arg) =>
        result
          ? [
              ...result.docs.map(({ id }: { id: string }) => ({
                type: "MyProperties" as const,
                id,
              })),
              {
                type: "MyProperties",
                id: arg.status ? `${arg.status.toUpperCase()}_LIST` : "LIST",
              },
            ]
          : [
              {
                type: "MyProperties",
                id: arg.status ? `${arg.status.toUpperCase()}_LIST` : "LIST",
              },
            ],
    }),

    // GET BY ID
    getPropertyById: builder.query<Property, string>({
      query: (id: string) => `/api/properties/${id}?depth=2`,
      providesTags: (result, error, id) => [
        { type: "Properties", id },
        { type: "MyProperties", id },
      ],
    }),

    // CREATE
    createProperty: builder.mutation<Property, Partial<Property>>({
      query: (data) => ({
        url: "/api/properties",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Properties", "MyProperties"],
    }),

    // UPDATE CHUNG
    updateProperty: builder.mutation<
      Property,
      { id: string; data: Partial<Property> }
    >({
      query: ({ id, data }) => ({
        url: `/api/properties/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        "Properties",
        "MyProperties",
        { type: "Properties", id },
        { type: "MyProperties", id },
      ],
    }),

    // Hạ tin / Đăng lại
    togglePublishProperty: builder.mutation<
      any,
      { id: string; isPublished: boolean }
    >({
      query: ({ id, isPublished }) => ({
        url: `/api/properties/${id}`,
        method: "PATCH",
        body: { is_published: isPublished },
      }),
      invalidatesTags: ["Properties", "MyProperties"],
    }),

    // Ẩn tin
    hideProperty: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/properties/${id}`,
        method: "PATCH",
        body: { is_hidden: true, is_published: false },
      }),
      invalidatesTags: ["Properties", "MyProperties"],
    }),

    // Hiện lại tin
    restoreProperty: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/properties/${id}`,
        method: "PATCH",
        body: { is_hidden: false, is_published: true },
      }),
      invalidatesTags: ["Properties", "MyProperties"],
    }),

    // Đẩy tin
    bumpProperty: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/properties/${id}`,
        method: "PATCH",
        body: {
          bumped_at: new Date().toISOString(),
          last_bumped_at: new Date().toISOString(),
        },
      }),
      invalidatesTags: ["Properties", "MyProperties"],
    }),

    // Cập nhật VIP
    updateVipStatus: builder.mutation<
      any,
      { id: string; days: number; isVip: boolean }
    >({
      query: ({ id, days, isVip }) => {
        const now = new Date().toISOString();
        let vipExpireAt = null;
        if (isVip && days > 0) {
          const expire = new Date();
          expire.setDate(expire.getDate() + days);
          vipExpireAt = expire.toISOString();
        }

        return {
          url: `/api/properties/${id}`,
          method: "PATCH",
          body: {
            is_vip: isVip,
            vip_activated_at: isVip ? now : null,
            vip_expire_at: vipExpireAt,
          },
        };
      },
      invalidatesTags: ["Properties", "MyProperties"],
    }),

    // Xóa vĩnh viễn
    deletePropertyPermanently: builder.mutation<any, string>({
      query: (id) => ({
        url: `/api/properties/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Properties", "MyProperties"],
    }),
  }),
});

export const {
  useGetPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useGetMyPropertiesByStatusQuery,
  useTogglePublishPropertyMutation,
  useHidePropertyMutation,
  useRestorePropertyMutation,
  useBumpPropertyMutation,
  useUpdateVipStatusMutation,
  useDeletePropertyPermanentlyMutation,
} = propertiesApi;
