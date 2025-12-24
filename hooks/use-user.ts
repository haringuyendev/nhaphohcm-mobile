import { useMeQuery } from "@/store/api/auth";
import { useGetWishlistPropertiesQuery } from "@/store/api/properties";
import { useGetPostLikesQuery } from "@/store/api/socialPosts";
import { useToggleFavoriteMutation, useGetMyPropertyStatsQuery } from "@/store/api/user";
import { User } from "@/types";
import { useEffect, useMemo, useState } from "react";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const { data, refetch, isLoading: userLoading } = useMeQuery();
  const [toggleFavoriteAPI] = useToggleFavoriteMutation();
  const {data:statsData, refetch:statsRefetch, isLoading:statsLoading }=useGetMyPropertyStatsQuery()
  const favoritePropertiesId=useMemo(()=>{
    return data?.user?.favoriteProperties?.map((p:any)=>p.id) ?? []; 
  },[data])
  const {data:postLikes}=useGetPostLikesQuery({userId:data?.user?.id}, {skip:!data?.user?.id})

  const stats = useMemo(() => {
    if (!statsData) {
      return {
        total: 0,
        published: 0,
        expired: 0,
        vip: 0,
        hidden:0
      };
    }

    return {
      total: statsData.total?.totalDocs ?? 0,
      published: statsData.published?.totalDocs ?? 0,
      expired: statsData.expired?.totalDocs ?? 0,
      vip: statsData.vip?.totalDocs ?? 0,
      hidden:statsData.hidden?.totalDocs ?? 0
    };
  }, [statsData]);

  const {data:propertyData, refetch:favoriteRefetch, isLoading:favoriteLoading}=useGetWishlistPropertiesQuery(favoritePropertiesId);
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
    reloadStats:statsRefetch,
    reloadFavorite:favoriteRefetch,
    loading: userLoading,
    statsLoading,
    stats,
    favoriteLoading,
    postLikes:postLikes?.docs ?? []
  };
}
