import { createSlice } from "@reduxjs/toolkit";

const initialState = localStorage.getItem("cart")
    ? JSON.parse(localStorage.getItem("cart"))
    : { cartItems: [], shippingAddress: {}, paymentMethod: "Razorpay" };

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        saveShippingAddress: (state, action) => {
            state.shippingAddress = action.payload;
            localStorage.setItem("cart", JSON.stringify(state));
        },

        savePaymentMethod: (state, action) => {
            state.paymentMethod = action.payload;
            localStorage.setItem("cart", JSON.stringify(state));
        },
    }
});

export const {
    savePaymentMethod,
    saveShippingAddress,
} = cartSlice.actions;

export default cartSlice.reducer;