
import { PRODUCT_URL, UPLOAD_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword, page }) => ({
        url: `${PRODUCT_URL}`,
        params: { keyword, page }
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Product"],
    }),

    getProductById: builder.query({
      query: (id) => `${PRODUCT_URL}/${id}`,
      providesTags: (result, error, id) => [
        { type: "Product", id: id },
      ],
    }),

    getProductsByIds: builder.query({
      query: (ids) => ({
        url: `${PRODUCT_URL}/idarray`,
        params: { ids: ids.join(",") }, 
      }),
    }),

    allProducts: builder.query({
      query: () => `${PRODUCT_URL}`,
      providesTags: ["Product"],
      keepUnusedDataFor: 5,
    }),

    addProduct: builder.mutation({
      query: (productData) => ({
        url: `${PRODUCT_URL}`,
        method: "POST",
        body: productData,
      }),
      invalidatesTags: ["Product"],
    }),

    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `${PRODUCT_URL}/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),

    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: `${UPLOAD_URL}`,
        method: "POST",
        body: data,
      }),
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `${PRODUCT_URL}/${id}`,
        method: "DELETE",
      }),
      providesTags: ["Product"],
    }),
    deleteImage: builder.mutation({
      query: ({ id, index }) => ({
        url: `${PRODUCT_URL}/${id}/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    updateWishlist: builder.mutation({
      query: ({ productId, color }) => ({
        url: `${PRODUCT_URL}/update-wishlist`,
        method: "POST",
        body: { productId, color },
      }),
      invalidatesTags: ["Product"],
    }),

    getWishlist: builder.query({
      query: () => `${PRODUCT_URL}/get-wishlist`,
      keepUnusedDataFor: 5,
    }),

    createReview: builder.mutation({
      query: (data) => ({
        url: `${PRODUCT_URL}/${data.productId}/reviews`,
        method: "POST",
        body: data,
      }),
    }),

    getTopProducts: builder.query({
      query: () => `${PRODUCT_URL}/top`,
      keepUnusedDataFor: 5,
    }),

    getNewProducts: builder.query({
      query: () => `${PRODUCT_URL}/new`,
      providesTags: ["Product"],
      keepUnusedDataFor: 5,
    }),

    fetchRelatedProducts: builder.query({
      query: (id) => `${PRODUCT_URL}/related/${id}`,
      providesTags: ["Product"],
      keepUnusedDataFor: 5,
    }),

    filterProducts: builder.query({
      query: ({ search, categories,  colors,minPrice, maxPrice,  sortBy, page}) => {
        const params = new URLSearchParams();

        if (search) params.append("search", search);
        if (categories.length) categories.forEach((cat) => params.append("category", cat));
        if (colors.length) colors.forEach((color) => params.append("color", color));
        if (minPrice) params.append("minPrice", minPrice);
        if (maxPrice) params.append("maxPrice", maxPrice);
       
        if (sortBy) params.append("sortBy", sortBy);
        params.append("page", page);
       

        return `${PRODUCT_URL}/shop-products?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductByIdQuery,
  useGetProductsQuery,
  useAllProductsQuery,
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteImageMutation,
  useDeleteProductMutation,
  useCreateReviewMutation,
  useGetTopProductsQuery,
  useGetNewProductsQuery,
  useUploadProductImageMutation,
  useFetchRelatedProductsQuery,
  useFilterProductsQuery,
  useGetProductsByIdsQuery,
  useUpdateWishlistMutation,
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
} = productApiSlice;
