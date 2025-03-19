import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL, USERS_URL } from "../constants";
import { logout, updateAccessToken } from "../features/auth/authSlice";
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userToken;
    const refreshToken = getState().auth.refreshToken;
    console.log("refresf",refreshToken)
    console.log("Access Token:", token);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  console.log("API Result:", result); 

  if (result.error && result.error.status === 401) {
    console.log("Access token expired, refreshing...");

    const refreshToken = api.getState().auth.refreshToken || localStorage.getItem("refreshToken");
    console.log("Refresh Token:", refreshToken); 

    if (!refreshToken) {
      console.log("No refresh token found, logging out...");
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await baseQuery(
      { url: `${USERS_URL}/auth/refresh`, method: "POST", body: { refreshToken } },
      api,
      extraOptions
    );

    console.log("Refresh Result:", refreshResult); 

    if (refreshResult.data) {
      console.log("New Access Token:", refreshResult.data.accessToken); 
      api.dispatch(updateAccessToken(refreshResult.data.accessToken));
      localStorage.setItem("userToken", refreshResult.data.accessToken); 
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
  tagTypes: ["Product", "Orders", "User", "Category"],
  endpoints: () => ({}),
});


