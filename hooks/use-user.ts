import { useMeQuery } from "@/store/api/auth";
import { useGetWishlistPropertiesQuery } from "@/store/api/properties";
import { useToggleFavoriteMutation } from "@/store/api/user";
import { User } from "@/types";
import { useEffect, useMemo, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const { data, refetch, isLoading } = useMeQuery();
  const [toggleFavoriteAPI] = useToggleFavoriteMutation();
  const favoritePropertiesId=useMemo(()=>{
    return data?.user?.favoriteProperties.map((p:any)=>p.id) ?? []; 
  },[data])
  const {data:propertyData}=useGetWishlistPropertiesQuery(favoritePropertiesId);
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    }
  }, [data]);

  return {
    user,
    favorites: favoritePropertiesId,
    favoriteProperties:propertyData?.docs ?? [],
    toggleFavorite:toggleFavoriteAPI,
    setUser,       // Nếu muốn set trực tiếp
    reloadUser: refetch,
    loading: isLoading,
  };
}
