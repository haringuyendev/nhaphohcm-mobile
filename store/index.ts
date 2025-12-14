// src/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./api";
import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux";
import appReducer from "./slices/app";

export const store = configureStore({
  reducer: {
    app: appReducer,
    // RTK Query reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefault) =>
    getDefault().concat(baseApi.middleware),
});

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

