
import { apiSlice } from "./apiSlice";
import { CATEGORY_URL } from "../constants";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: `${CATEGORY_URL}/add-category`,
        method: "POST",
        body: newCategory,
      }),
      
    }),

    updateCategory: builder.mutation({
      query: ({ categoryId, updatedCategory }) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "PUT",
        body: updatedCategory,
      }),
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `${CATEGORY_URL}/${categoryId}`,
        method: "DELETE",
      }),
    }),

    fetchCategories: builder.query({
      query: () => `${CATEGORY_URL}/categories`,
    }),
  }),
});

export const {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} = categoryApiSlice;
