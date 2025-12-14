// use-session.ts
import { useState } from "react";
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from "expo-router";
import React from "react";

export function useSession() {
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadToken = async () => {
        const t = await SecureStore.getItemAsync("token");
        if (isActive) {
          setToken(t);
          setTokenChecked(true);
        }
      };

      loadToken();

      return () => {
        isActive = false;
      };
    }, [])
  );

  return {
    token,
    tokenChecked,
    isAuthenticated: !!token,
  };
}
