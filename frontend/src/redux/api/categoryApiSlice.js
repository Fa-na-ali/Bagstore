
import { apiSlice } from "./apiSlice";
import { CATEGORY_URL } from "../constants";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    addCategory: builder.mutation({
      query: (newCategory) => ({
        url: `${CATEGORY_URL}`,
        method: "POST",
        body: newCategory,
      }),
      
    }),
    updateCategory: builder.mutation({
      query: ({ id,...data }) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `${CATEGORY_URL}/${id}`,
        method: "DELETE",
      }),
    }),
    specificCategories: builder.query({
      query: (id) => ({
        url:`${CATEGORY_URL}/${id}`,
      })
    }),
    fetchCategories: builder.query({
      query: () => ({
        url: `${CATEGORY_URL}`,
      }),
      providesTags: ["Category"],
      keepUnusedDataFor: 5,
    }),
    searchCategories: builder.query({
      query: (search) => ({
        url: `${CATEGORY_URL}/search/${search}`,
      })
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
