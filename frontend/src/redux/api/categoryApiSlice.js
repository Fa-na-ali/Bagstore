
import { CATEGORY_URL } from "../../constants/constants";
import { apiSlice } from "./apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: `${CATEGORY_URL}`,
        method: "POST",
        body: newCategory,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
    specificCategories: builder.query({
      query: (id) => ({
        url: `${CATEGORY_URL}/${id}`,
      })
    }),
    fetchCategories: builder.query({
      query: () => ({
        url: `${CATEGORY_URL}/all`,
      }),
      providesTags: ["Category"],
      keepUnusedDataFor: 5,
    }),
    searchCategories: builder.query({
      query: ({ keyword, page }) => ({
        url: `${CATEGORY_URL}`,
        params: { keyword, page }
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Category"],
    }),

  }),
});

export const {
  useAddCategoryMutation,
  useSearchCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
  useSpecificCategoriesQuery
} = categoryApiSlice;
