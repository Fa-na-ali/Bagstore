import { apiSlice } from "./apiSlice";
import { USERS_URL } from "../constants";

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getSalesReport: builder.query({
      query: ({ filter, startDate, endDate }) => ({
        url: `${USERS_URL}/sales-report-data`,
        params: { filter, startDate, endDate }
      }),
    }),
  })
})

export const {
  useGetSalesReportQuery,
} = dashboardApiSlice;