import { createSlice } from "@reduxjs/toolkit";

// initialize userToken from local storage
const userToken = localStorage.getItem('userToken')
  ? localStorage.getItem('userToken')
  : null

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
    userToken
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      state.userToken = action.payload.token;  
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
      localStorage.setItem("userToken", action.payload.token);  
  

      const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
      localStorage.setItem("expirationTime", expirationTime);
    },
    logout: (state) => {
      localStorage.removeItem('userToken');
      state.userInfo = null;
      localStorage.clear();
      state.userToken = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;