import { useEffect, useState, useMemo } from "react";
import { useMeQuery } from "@/store/api/auth";
import { User } from "@/types";
import { useToggleFavoriteMutation } from "@/store/api/user";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const { data, refetch, isLoading } = useMeQuery();
  const [toggleFavoriteAPI] = useToggleFavoriteMutation();
  
  const favoriteProperties=useMemo(()=>{
    return data?.user?.favoriteProperties ?? [];
  },[data])
  const favoritePropertiesId=useMemo(()=>{
    return data?.user?.favoriteProperties.map((p:any)=>p.id) ?? [];
  },[data])

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);

  return {
    user,
    favorites: favoritePropertiesId,
    favoriteProperties,
    toggleFavorite:toggleFavoriteAPI,
    setUser,       // Nếu muốn set trực tiếp
    reloadUser: refetch,
    loading: isLoading,
  };
}
