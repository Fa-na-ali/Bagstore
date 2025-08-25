import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL, USERS_URL } from "../../constants/constants";
import { logout, updateAccessToken } from "../features/auth/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.userToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const refreshToken = api.getState().auth.refreshToken || localStorage.getItem("refreshToken");

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await baseQuery(
      { url: `${USERS_URL}/auth/refresh`, method: "POST", body: { refreshToken } },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      api.dispatch(updateAccessToken(refreshResult.data.accessToken));
      localStorage.setItem("userToken", refreshResult.data.accessToken);
      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Orders", "User", "Category", "Wallet"],
  endpoints: () => ({}),
});


