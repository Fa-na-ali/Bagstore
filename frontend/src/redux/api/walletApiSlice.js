import { apiSlice } from "./apiSlice";
import { WALLET_URL } from "../constants";

export const walletApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTransaction: builder.query({
      query: (transactionId) => `${WALLET_URL}/admin/${transactionId}`,
    }),

    getAllWallets: builder.query({
      query: ({ page }) => ({
        url: `${WALLET_URL}/admin/wallets`,
        params: { page }
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Wallet"],
    }),

    createOrder: builder.mutation({
      query: (amount) => ({
        url: `${WALLET_URL}/create-order`,
        method: 'POST',
        body: { amount },
      }),
    }),

    getRazorpayKey: builder.query({
      query: () => `${WALLET_URL}/razorpay-key`,
    }),

    updateWallet: builder.mutation({
      query: (amount) => ({
        url: `${WALLET_URL}/update`,
        method: 'POST',
        body: { amount },
      }),
      invalidatesTags: ['Wallet'],
    }),

    getMyWallet: builder.query({
      query: () => `${WALLET_URL}/wallet`,
      providesTags: ['Wallet'],
    }),
  })
})

export const{
  useGetTransactionQuery,
  useGetAllWalletsQuery,
  useCreateOrderMutation,
  useGetRazorpayKeyQuery,
  useUpdateWalletMutation,
  useGetMyWalletQuery
} = walletApiSlice