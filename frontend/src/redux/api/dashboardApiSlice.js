import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query({
      query: ({ filter, startDate, endDate }) => ({
        url: `${USERS_URL}/admin/sales-report-data`,
        params: { filter, startDate, endDate }
      }),
    }),

    getDashboardData: builder.query({
      query: () =>`${USERS_URL}/admin/dashboard`,
    }),
  })
})

export const {
  useGetSalesReportQuery,
  useGetDashboardDataQuery,
} = dashboardApiSlice;