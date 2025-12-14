import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { CollectionResponse, User } from '../types/payload-types';

// Define a service using a base URL and expected endpoints
export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL + '/users',
  }),
  endpoints: (build) => ({
    getUsers: build.query<CollectionResponse<User>, string>({
      query: () => '',
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUsersQuery } = userApi;
