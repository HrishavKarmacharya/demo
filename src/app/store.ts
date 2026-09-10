import { configureStore } from "@reduxjs/toolkit";
import { productApi } from "@/services/productApi";
import wishlistReducer from "@/app/wishlistSlice";
import cartReducer from "@/app/cartSlice";

export const store = configureStore({
  reducer: {
    [productApi.reducerPath]: productApi.reducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;