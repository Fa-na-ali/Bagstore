import { createSlice } from "@reduxjs/toolkit";
import { updateCart } from "../../../utils/cartUtils";

const initialState = localStorage.getItem("cart")
  ? JSON.parse(localStorage.getItem("cart"))
  : { cartItems: [], shippingAddress: {}, paymentMethod: "PayPal" };

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cartItems.find((x) => x._id === item._id);
      if (existItem) {

        const newQuantity = existItem.qty + item.qty;
        const maxAllowed = 5;

        if (newQuantity > maxAllowed) {

          state.cartItems = state.cartItems.map((x) =>
            x._id === existItem._id ? { ...x, qty: maxAllowed, } : x
          );
          toast.error(`You can only add up to ${maxAllowed} units of this product`);
        } else {

          state.cartItems = state.cartItems.map((x) =>
            x._id === existItem._id ? { ...x, qty: newQuantity, } : x
          );
        }
      } else {

        state.cartItems = [...state.cartItems, item];
      }

      return updateCart(state);
    },
    syncCartWithDatabase: (state, action) => {
      const latestProducts = action.payload;
      state.cartItems = state.cartItems.map((cartItem) => {
        const latestProduct = latestProducts.find((p) => p._id === cartItem._id);
        if (latestProduct) {
          return {
            ...cartItem,
            quantity: latestProduct.quantity,
            qty: Math.min(cartItem.qty, latestProduct.quantity),

          };
        }
        return cartItem;
      });
      return updateCart(state);
    },
    updateCartItemQuantity: (state, action) => {
      const { productId, qty } = action.payload;
      const existItem = state.cartItems.find((x) => x._id === productId);

      if (existItem) {

        state.cartItems = state.cartItems.map((x) =>
          x._id === productId ? { ...x, qty } : x
        );
      }

      return updateCart(state);
    },

    removeFromCart: (state, action) => {
      state.cartItems = state.cartItems.filter((x) => x._id !== action.payload);
      return updateCart(state);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
      localStorage.setItem("cart", JSON.stringify(state));
    },

    clearCartItems: (state, action) => {
      state.cartItems = [];
      localStorage.removeItem("cart");
    },

    resetCart: (state) => (state = initialState),
  },
});

export const {
  addToCart,
  updateCartItemQuantity,
  syncCartWithDatabase,
  removeFromCart,
  savePaymentMethod,
  saveShippingAddress,
  clearCartItems,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;