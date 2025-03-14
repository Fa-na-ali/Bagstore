import { createSlice } from "@reduxjs/toolkit";

// initialize userToken from local storage
const userToken = localStorage.getItem('userToken')
  ? localStorage.getItem('userToken')
  : null
const refreshToken = localStorage.getItem("refreshToken") || null;
const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  userToken,
  refreshToken,
  updatedUser: localStorage.getItem("updatedUser")
    ? JSON.parse(localStorage.getItem("updatedUser"))
    : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.userToken = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
      localStorage.setItem("userToken", action.payload.token);
      localStorage.setItem("refreshToken", action.payload.refreshToken);


      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("expirationTime", expirationTime);
    },
    updateAccessToken: (state, action) => {
      state.userToken = action.payload
      localStorage.setItem("userToken", action.payload);
    },
    updateProfile: (state, action) => {
      state.updatedUser = null
      state.updatedUser = action.payload
      localStorage.setItem("updatedUser", JSON.stringify(action.payload));

    },
    logout: (state) => {
      state.userInfo = null;
      state.userToken = null;
      state.refreshToken = null;
      localStorage.removeItem("userInfo");
      localStorage.removeItem("userToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expirationTime");
    },
  },
});

export const { setCredentials, updateAccessToken, updateProfile, logout } = authSlice.actions;

export default authSlice.reducer;