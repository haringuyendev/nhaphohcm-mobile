// src/hooks/useApp.ts
import { useDispatch, useSelector } from "react-redux";
import { useMemo, useCallback, useEffect } from "react";
import { RootState, AppDispatch } from "@/store";
import {
  addProperty,
  updateProperty,
  deleteProperty,
  pushProperty,
  upgradeToVIP,
  toggleFavorite,
  joinCommunity,
  leaveCommunity,
  addPost,
  togglePostLike,
  incrementShareCount,
  loadAppData,
} from "@/store/slices/app";
import { Property, SearchFilters } from "@/types/property";
import { Post } from "@/types/community";

export const useApp = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, favorites, communities, posts, isLoading } = useSelector(
    (state: RootState) => state.app
  );
  
  // ========== PROPERTY SELECTORS ==========
  const getPropertyById = useCallback(
    (id: string) => properties.find((p) => p.id === id),
    [properties]
  );

  const getVIPProperties = useMemo(() => {
    return properties
      .filter((p) => p.isVIP && p.status === "active")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [properties]);

  const getActiveProperties = useMemo(() => {
    return properties
      .filter((p) => p.status === "active")
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [properties]);

  const getMyProperties = useCallback(
    (userId: string) => properties.filter((p) => p.userId === userId),
    [properties]
  );

  const getFavoriteProperties = useMemo(() => {
    return properties.filter((p) => favorites.includes(p.id));
  }, [properties, favorites]);

  const searchProperties = useCallback(
    (filters: SearchFilters) => {
      return properties
        .filter((p) => {
          if (p.status !== "active") return false;

          if (
            filters.transactionType &&
            p.transactionType !== filters.transactionType
          )
            return false;
          if (filters.propertyType && p.propertyType !== filters.propertyType)
            return false;
          if (filters.province && p.location.province !== filters.province)
            return false;
          if (filters.district && p.location.district !== filters.district)
            return false;
          if (filters.ward && p.location.ward !== filters.ward) return false;

          const priceInMillion =
            p.priceUnit === "billion" ? p.price * 1000 : p.price;
          if (
            filters.priceMin !== undefined &&
            priceInMillion < filters.priceMin
          )
            return false;
          if (
            filters.priceMax !== undefined &&
            priceInMillion > filters.priceMax
          )
            return false;

          if (filters.areaMin !== undefined && p.area < filters.areaMin)
            return false;
          if (filters.areaMax !== undefined && p.area > filters.areaMax)
            return false;
          if (
            filters.bedrooms !== undefined &&
            p.bedrooms &&
            p.bedrooms < filters.bedrooms
          )
            return false;
          if (filters.direction && p.direction !== filters.direction)
            return false;

          if (filters.keyword) {
            const keyword = filters.keyword.toLowerCase();
            return (
              p.title.toLowerCase().includes(keyword) ||
              p.description.toLowerCase().includes(keyword) ||
              p.location.fullAddress.toLowerCase().includes(keyword)
            );
          }

          return true;
        })
        .sort((a, b) => {
          if (a.isVIP && !b.isVIP) return -1;
          if (!a.isVIP && b.isVIP) return 1;
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        });
    },
    [properties]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  // ========== COMMUNITY SELECTORS ==========
  const getCommunityById = useCallback(
    (id: string) => communities.find((c) => c.id === id),
    [communities]
  );

  const getJoinedCommunities = useMemo(
    () => communities.filter((c) => c.isJoined),
    [communities]
  );

  const getOwnedCommunities = useMemo(
    () => communities.filter((c) => c.isOwned),
    [communities]
  );

  const getRecommendCommunities = useMemo(
    () => communities.filter((c) => !c.isJoined && !c.isOwned),
    [communities]
  );

  // ========== POST SELECTORS ==========
  const getPostsByCommunity = useCallback(
    (communityId: string) => {
      return posts
        .filter((p) => p.communityId === communityId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    [posts]
  );

  const getPostWithCommunity = useMemo(() => {
    return posts.map((post) => {
      const community = communities.find((c) => c.id === post.communityId);
      return { ...post, community };
    });
  }, [posts, communities]);

  // ========== ACTIONS (dispatch) ==========
  const actions = {
    addProperty: (
      data: Omit<Property, "id" | "createdAt" | "updatedAt" | "viewCount">
    ) => dispatch(addProperty(data)),
    updateProperty: (id: string, updates: Partial<Property>) =>
      dispatch(updateProperty({ id, updates })),
    deleteProperty: (id: string) => dispatch(deleteProperty(id)),
    pushProperty: (id: string) => dispatch(pushProperty(id)),
    upgradeToVIP: (id: string, days: number) =>
      dispatch(upgradeToVIP({ id, days })),
    toggleFavorite: (id: string) => dispatch(toggleFavorite(id)),
    joinCommunity: (communityId: string) =>
      dispatch(joinCommunity(communityId)),
    leaveCommunity: (communityId: string) =>
      dispatch(leaveCommunity(communityId)),
    addPost: (
      post: Omit<
        Post,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "likeCount"
        | "commentCount"
        | "shareCount"
        | "isLiked"
      >
    ) => dispatch(addPost(post)),
    togglePostLike: (postId: string) => dispatch(togglePostLike(postId)),
    incrementShareCount: (postId: string) =>
      dispatch(incrementShareCount(postId)),
  };

  return {
    // State
    properties,
    favorites,
    communities,
    posts,
    isLoading,

    // Property
    getPropertyById,
    getVIPProperties,
    getActiveProperties,
    getMyProperties,
    getFavoriteProperties,
    searchProperties,
    isFavorite,

    // Community
    getCommunityById,
    getJoinedCommunities,
    getOwnedCommunities,
    getRecommendCommunities,

    // Post
    getPostsByCommunity,
    getPostWithCommunity,

    // Actions
    ...actions,
  };
};
