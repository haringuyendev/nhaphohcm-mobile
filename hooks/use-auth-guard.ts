import { useEffect } from "react";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await SecureStore.getItemAsync("token");

      if (!token) {
        router.replace("/login"); // 🔥 CHUYỂN NGAY ĐẾN LOGIN
        return;
      }
    };

    checkAuth();
  }, [router]);
}
