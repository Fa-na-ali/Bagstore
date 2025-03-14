import { apiSlice } from "./apiSlice";
import { ORDERS_URL, PAYPAL_URL } from "../constants";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),

    getOrderById: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),

    cancelOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/cancel/${orderId}`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"], // Invalidate cache to update UI
    }),

    getAllOrders: builder.query({
      query: ({ searchTerm = "", status = "", page = 1 }) => {
        const params = new URLSearchParams();

        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status) params.append("status", status);
        params.append("page", page);
        return `${ORDERS_URL}/admin/orders?${params.toString()}`
      },
      providesTags: ["Orders"],

    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/admin/orders/edit/${id}`,
        method: "GET",
      }),
      providesTags: ["Orders"],
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useGetAllOrdersQuery } = ordersApiSlice;
