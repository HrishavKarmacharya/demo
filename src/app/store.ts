import { configureStore } from "@reduxjs/toolkit";
import {productApi} from "@/services/productAPI";

export const store = configureStore({
    reducer: {
        [productApi.reducerPath]: productApi.reducer
    },
    middleware: (getDefaultMidleware) =>
        getDefaultMidleware().concat(productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;