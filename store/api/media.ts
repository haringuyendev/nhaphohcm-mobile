// mediaApi.ts (hoặc file api tương ứng)

import { baseApi } from ".";

export const mediaApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMedia: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: '/api/media',
        method: 'POST',
        body: formData,
        // KHÔNG set headers Content-Type ở đây
        // prepareHeaders sẽ tự thêm Authorization nếu có token
      }),
      invalidatesTags: ["Media"],
    }),
  }),
});

export const { useCreateMediaMutation } = mediaApi;