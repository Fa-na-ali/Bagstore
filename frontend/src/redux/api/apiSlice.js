import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../constants";
import { logout,updateAccessToken } from "../features/auth/authSlice";
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include", 
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userToken;  
    console.log("Access Token:", token);
    
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});


const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  
  if (result.error && result.error.status === 401) {
    console.log("Access token expired, refreshing...");

    const refreshToken = api.getState().auth.refreshToken;
    console.log("refreshtoken",refreshToken)
    
    if (!refreshToken) {
      console.log("No refresh token found, logging out...");
      api.dispatch(logout());
      return result;
    }
      
      const refreshResult = await baseQuery(
        { url: "/auth/refresh", method: "POST", body: { refreshToken } },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        
        api.dispatch(updateAccessToken(refreshResult.data.accessToken));
  
        
        result = await baseQuery(args, api, extraOptions);
      } else {
        console.log("Refresh failed, logging out...");
        api.dispatch(logout());
      }
    }
  return result;
};


export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth, 
  tagTypes: ["Product", "Order", "User", "Category"],
  endpoints: () => ({}),
});
