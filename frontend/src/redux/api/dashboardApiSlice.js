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

      downloadExcelReport: builder.mutation({
        query: ({ filter, startDate, endDate }) => ({
          url:`${USERS_URL}/sales-report-download`,
          method: 'POST',
          body: { filter, startDate, endDate },
          responseHandler: (response) => response.blob()
        })
      }),

      downloadPdfReport: builder.mutation({
        query: ({ filter, startDate, endDate }) => ({
          url: `${USERS_URL}/sales-report-download`,
          method: 'POST',
          body: { filter, startDate, endDate },
          responseHandler: (response) => response.blob()
        })
      })

})
})

export const {
    useGetSalesReportQuery,
    useDownloadExcelReportMutation,
    useDownloadPdfReportMutation
  } = dashboardApiSlice;