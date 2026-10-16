"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { store } from "@/stores/store";
import { useAppDispatch, useAppSelector } from "@/stores/hooks";
import { selectIsAuthenticated } from "@/stores/slices/authSlice";
import { restoreSession } from "@/features/auth/api";
import { fetchCategories } from "@/features/categories/api";
import { fetchBrands } from "@/features/brands/api";
import { fetchProducts } from "@/features/products/api";

function SessionRestorer() {
  const hasRestored = useRef(false);

  useEffect(() => {
    if (hasRestored.current) return;
    hasRestored.current = true;
    store.dispatch(restoreSession());
  }, []);

  return null;
}

function CatalogLoader() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    dispatch(fetchCategories());
    dispatch(fetchBrands());
    dispatch(fetchProducts());
  }, [dispatch, isAuthenticated]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRestorer />
      <CatalogLoader />
      {children}
    </Provider>
  );
}
