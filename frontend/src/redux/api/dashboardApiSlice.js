import { USERS_URL } from "../../constants/constants";
import { apiSlice } from "./apiSlice";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query({
      query: ({ filter, startDate, endDate }) => ({
        url: `${USERS_URL}/admin/sales-report-data`,
        params: { filter, startDate, endDate }
      }),
    }),

    getDashboardData: builder.query({
      query: ({ filter, startDate, endDate }) => ({
        url: `${USERS_URL}/admin/dashboard`,
        params: { filter, startDate, endDate }
      }),
      providesTags: ['Dashboard']
    })
  })
})
export const {
  useGetSalesReportQuery,
  useGetDashboardDataQuery,
} = dashboardApiSlice;