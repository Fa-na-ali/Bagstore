import { ORDERS_URL } from "../../constants/constants";
import { apiSlice } from "./apiSlice";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
      invalidatesTags: ["Order"],  
    }),

    getMyOrders: builder.query({
      query: (searchTerm) => ({
        url: `${ORDERS_URL}/mine`,
        params: { searchTerm }
      }),
      keepUnusedDataFor: 5,
    }),

    getOrderById: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),

    getPendingOrderById: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/pending/order-details/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),

    cancelOrder: builder.mutation({
      query: ({ orderId, item, cancelReason }) => ({
        url: `${ORDERS_URL}/cancel`,
        method: "PUT",
        body: { orderId, item, cancelReason },
      }),
      invalidatesTags: ["Order"],
    }),

    setItemStatus: builder.mutation({
      query: ({ status, item, id }) => ({
        url: `${ORDERS_URL}/save-item-status`,
        method: "PUT",
        body: { status, item, id },
      }),
      invalidatesTags: ["Order"],
    }),

    returnOrder: builder.mutation({
      query: ({ orderId, item, returnReason }) => ({
        url: `${ORDERS_URL}/return-request`,
        method: "POST",
        body: { orderId, item, returnReason },
      }),
    }),

    getAllOrders: builder.query({
      query: ({ searchTerm = "", status = "", page = 1 }) => {
        const params = new URLSearchParams();

        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status) params.append("status", status);
        params.append("page", page);
        return `${ORDERS_URL}/admin/orders?${params.toString()}`
      },
      providesTags: ["Order"],

    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/admin/orders/edit/${id}`,
        method: "GET",
      }),
      providesTags: ["Order"],
      keepUnusedDataFor: 5,
    }),
  }),
});

export const { useCreateOrderMutation,
  useGetOrderDetailsQuery,
  useGetOrderByIdQuery,
  useGetMyOrdersQuery,
  useSetItemStatusMutation,
  useCancelOrderMutation,
  useReturnOrderMutation,
  useGetAllOrdersQuery,
  useGetPendingOrderByIdQuery } = ordersApiSlice;
