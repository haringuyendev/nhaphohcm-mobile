import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CollectionResponse, Property } from '../types/payload-types';

// Define a service using a base URL and expected endpoints
export const propertyApi = createApi({
  reducerPath: 'propertyApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL + '/properties',
  }),
  endpoints: (build) => ({
    getProperties: build.query<CollectionResponse<Property>, null>({
      query: () => '',
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetPropertiesQuery } = propertyApi;
