// src/store/api/filter-api.ts

import type { Province, District, Ward, PropertyType } from "@/types";
import { baseApi } from "./index";
import qs from "qs";
import { generatePayloadQuery } from "@/utils";

export const filterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProvinces: builder.query<Province[], void>({
      query: () => ({
        url: `/api/provinces`,
        method: "GET",
        params: { limit: 0 },
      }),
      transformResponse: (res: any) => res.docs ?? [],
      providesTags: ["Provinces"],
    }),

    getDistricts: builder.query<District[], { provinceCode?: number | string }>({
      query: ({ provinceCode }) => ({
        url: `/api/districts`,
        method: "GET",
        params: {
          limit: 0,
          ...(provinceCode
            ? { where: JSON.stringify({ "province.code": { equals: Number(provinceCode) } }) }
            : {}),
        },
      }),
      transformResponse: (res: any) => res.docs ?? [],
      providesTags: ["Districts"],
    }),

    getWards: builder.query<Ward[], { districtCode?: number | string }>({
      
      query: ({ districtCode } = {}) => {
        // Build where object
        const where = districtCode
          ? { "district.code": { equals: Number(districtCode) } }
          : {};
    
        return generatePayloadQuery({
          path:'/api/wards',
          where,
          limit:0
        })
      },
      transformResponse: (res: any) => res.docs ?? [],
      providesTags: ["Wards"],
    }),

    getPropertyTypes: builder.query<PropertyType[], void>({
      query: () => {
        return generatePayloadQuery({
          path:'/api/property_type',
          limit:0
        })
      },
      transformResponse: (res: any) => res.docs ?? [],
      providesTags: ["PropertyTypes"],
    }),
  }),
});

export const {
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
  useGetPropertyTypesQuery,
} = filterApi;
