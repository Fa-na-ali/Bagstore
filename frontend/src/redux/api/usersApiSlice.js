import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../../constants/constants";

export const userApiSlice = apiSlice.injectEndpoints({
  tagTypes: ['User'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/login`,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/register`,
        method: "POST",
        body: data,
      }),
    }),
    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),
    verifyOtpPass: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-otp-password`,
        method: "POST",
        body: data,
      }),
    }),
    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/reset-password`,
        method: "POST",
        body: data,
      }),
    }),
    changePassword: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/change-password`,
        method: "POST",
        body: data,
      }),
    }),
    verifyOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-otp`,
        method: "POST",
        body: data,
      }),
    }),
    resendOtp: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/resend-otp`,
        method: "POST",
        body: data,
        headers: { "Content-Type": "application/json" },
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/logout`,
        method: "POST",
      }),
    }),
    searchUser: builder.query({
      query: (search) => ({
        url: `${USERS_URL}/search/${search}`,
      })
    }),
    profile: builder.query({
      query: () => ({
        url: `${USERS_URL}/account`,
      }),
    }),
    uploadImage: builder.mutation({
      query: ({ id, userData }) => ({
        url: `${USERS_URL}/upload/${id}`,
        method: "POST",
        body: userData,
      })
    }),
    deleteUserImage: builder.mutation({
      query: ({ id, index }) => ({
        url: `${USERS_URL}/${id}/${index}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),

    getUsers: builder.query({
      query: () => ({
        url: USERS_URL,
      }),
      providesTags: ["User"],
      keepUnusedDataFor: 5,
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `${USERS_URL}/${userId}`,
        method: "DELETE",
      }),
    }),
    unblockUser: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/${id}/unblock`,
        method: "PUT",
      }),
    }),
    getUserDetails: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    fetchUsers: builder.query({
      query: ({ keyword, page }) => ({
        url: `${USERS_URL}`,
        params: { keyword, page }
      }),
      keepUnusedDataFor: 5,
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: (userData) => ({
        url: `${USERS_URL}/account/edit`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    addAddress: builder.mutation({
      query: (addressData) => ({
        url: `${USERS_URL}/account/add-address`,
        method: "POST",
        body: addressData,
      }),
      invalidatesTags: ["User"],
    }),
    getAddress: builder.query({
      query: (id) => ({
        url: `${USERS_URL}/account/edit-address/${id}`,
      }),
      providesTags: ["Address"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${USERS_URL}/account/edit-address/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Address"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/account/delete-address/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    addCoupon: builder.mutation({
      query: (couponData) => ({
        url: `${USERS_URL}/admin/coupons/add`,
        method: "POST",
        body: couponData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    addReferralCoupon: builder.mutation({
      query: (couponData) => ({
        url: `${USERS_URL}/admin/refer-coupons/add`,
        method: "POST",
        body: couponData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    getAllCoupons: builder.query({
      query: ({ keyword, page }) => ({
        url: `${USERS_URL}/admin/coupons`,
        params: { keyword, page }
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Coupons"],
    }),

    getAllCouponsUser: builder.query({
      query: () => ({
        url: `${USERS_URL}/coupons`,

      }),
    }),

    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/admin/coupons/${id}`,
        method: "DELETE",
      }),
    }),

    unblockCoupon: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/admin/coupons/${id}/unblock`,
        method: "PUT",
      }),
    }),

    getCouponById: builder.query({
      query: (id) => `${USERS_URL}/admin/coupons/${id}`,
      providesTags: (result, error, id) => [
        { type: "Coupon", id: id },
      ],
    }),

    updateCoupon: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `${USERS_URL}/admin/coupons/edit/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),

    applyCoupon: builder.mutation({
      query: (couponData) => ({
        url: `${USERS_URL}/applyCoupon`,
        method: "POST",
        body: couponData,
      }),
    }),

    removeCoupon: builder.mutation({
      query: (couponData) => ({
        url: `${USERS_URL}/removecoupon`,
        method: "POST",
        body: couponData,
      }),
    }),

    addOffer: builder.mutation({
      query: (formData) => ({
        url: `${USERS_URL}/admin/offers/add`,
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    getAllOffers: builder.query({
      query: ({ keyword, page }) => ({
        url: `${USERS_URL}/admin/offers`,
        params: { keyword, page }
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Offers"],
    }),

    deleteOffer: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/admin/offers/${id}`,
        method: "DELETE",
      }),
    }),

    unblockOffer: builder.mutation({
      query: (id) => ({
        url: `${USERS_URL}/admin/offers/${id}/unblock`,
        method: "PUT",
      }),
    }),

    getOfferById: builder.query({
      query: (id) => `${USERS_URL}/admin/offers/${id}`,
      providesTags: (result, error, id) => [
        { type: "Offer", id: id },
      ],
    }),

    updateOffer: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `${USERS_URL}/admin/offers/edit/${id}`,
        method: "PUT",
        body: formData,
      }),
    }),

    getAllOffersToAdd: builder.query({
      query: () => ({
        url: `${USERS_URL}/admin/alloffers/`,

      }),
    }),

    initiatePayment: builder.mutation({
      query: (amount) => ({
        url: `${USERS_URL}/payment/razorpay/order`,
        method: 'POST',
        body: { amount },
      }),
    }),

    verifyPayment: builder.mutation({
      query: (body) => ({
        url: `${USERS_URL}/verify-payment`,
        method: 'POST',
        body,
      }),
    }),

    retryPayment: builder.mutation({
      query: (orderId) => ({
        url: `${USERS_URL}/retry-payment`,
        method: 'POST',
        body: { orderId },
      }),
    }),

    verifyRetryPayment: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/verify-retry-payment`,
        method: "POST",
        body: data,
      }),
    }),

    getReferralDetails: builder.query({
      query: () => ({
        url: `${USERS_URL}/account/referrals`,

      })
    }),

    getReferralCode: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/account/referrals/referral-code`,
        method: 'POST'
      }),
    }),

  })
})

export const {
  useLoginMutation,
  useLogoutMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation,
  useVerifyOtpPassMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useResendOtpMutation,
  useRegisterMutation,
  useSearchUserQuery,
  useProfileQuery,
  useGetUsersQuery,
  useDeleteUserMutation,
  useUpdateUserMutation,
  useFetchUsersQuery,
  useGetUserDetailsQuery,
  useAddAddressMutation,
  useGetAddressQuery,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useUploadImageMutation,
  useDeleteUserImageMutation,
  useAddCouponMutation,
  useGetCouponByIdQuery,
  useUpdateCouponMutation,
  useGetAllCouponsQuery,
  useDeleteCouponMutation,
  useGetAllCouponsUserQuery,
  useAddOfferMutation,
  useGetAllOffersQuery,
  useUpdateOfferMutation,
  useDeleteOfferMutation,
  useGetOfferByIdQuery,
  useGetAllOffersToAddQuery,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useInitiatePaymentMutation,
  useRetryPaymentMutation,
  useVerifyPaymentMutation,
  useVerifyRetryPaymentMutation,
  useAddReferralCouponMutation,
  useGetReferralDetailsQuery,
  useGetReferralCodeMutation,
  useUnblockUserMutation,
  useUnblockCouponMutation,
  useUnblockOfferMutation
} = userApiSlice;