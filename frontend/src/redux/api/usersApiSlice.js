import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const userApiSlice = apiSlice.injectEndpoints({
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
      query: (id) =>({
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
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useVerifyOtpMutation,
  useForgotPasswordMutation ,
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
  useDeleteAddressMutation
} = userApiSlice;