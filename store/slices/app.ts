// src/store/appSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Property } from '@/types/property';
import { Community, Post } from '@/types/community';
import { mockProperties, mockCommunities, mockPosts } from '@/mocks/data';

const STORAGE_KEY = '@binhthanh_properties';
const FAVORITES_KEY = '@binhthanh_favorites';
const COMMUNITIES_KEY = '@binhthanh_communities';
const POSTS_KEY = '@binhthanh_posts';

interface AppState {
  properties: Property[];
  favorites: string[];
  communities: Community[];
  posts: Post[];
  isLoading: boolean;
}

const initialState: AppState = {
  properties: [],
  favorites: [],
  communities: [],
  posts: [],
  isLoading: true,
};

// Async thunk để load data lần đầu
export const loadAppData = createAsyncThunk('app/loadData', async () => {
  try {
    const [storedProps, storedFavs, storedComms, storedPosts] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(FAVORITES_KEY),
      AsyncStorage.getItem(COMMUNITIES_KEY),
      AsyncStorage.getItem(POSTS_KEY),
    ]);

    const properties = storedProps ? JSON.parse(storedProps) : mockProperties;
    const favorites = storedFavs ? JSON.parse(storedFavs) : [];
    const communities = storedComms ? JSON.parse(storedComms) : mockCommunities;
    const posts = storedPosts ? JSON.parse(storedPosts) : mockPosts;

    // Nếu chưa có dữ liệu -> lưu mock data
    if (!storedProps) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProperties));
    if (!storedComms) await AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(mockCommunities));
    if (!storedPosts) await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(mockPosts));

    return { properties, favorites, communities, posts };
  } catch (error) {
    console.error('Error loading data:', error);
    return { properties: mockProperties, favorites: [], communities: mockCommunities, posts: mockPosts };
  }
});

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    // Properties
    addProperty(state, action: PayloadAction<Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>>) {
      const newProperty: Property = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
      };
      state.properties.unshift(newProperty);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.properties));
    },

    updateProperty(state, action: PayloadAction<{ id: string; updates: Partial<Property> }>) {
      const { id, updates } = action.payload;
      state.properties = state.properties.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.properties));
    },

    deleteProperty(state, action: PayloadAction<string>) {
      state.properties = state.properties.filter((p) => p.id !== action.payload);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.properties));
    },

    pushProperty(state, action: PayloadAction<string>) {
      state.properties = state.properties.map((p) =>
        p.id === action.payload
          ? { ...p, lastPushedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : p
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.properties));
    },

    upgradeToVIP(state, action: PayloadAction<{ id: string; days: number }>) {
      const { id, days } = action.payload;
      const vipExpiryDate = new Date();
      vipExpiryDate.setDate(vipExpiryDate.getDate() + days);

      state.properties = state.properties.map((p) =>
        p.id === id
          ? { ...p, isVIP: true, vipExpiryDate: vipExpiryDate.toISOString(), updatedAt: new Date().toISOString() }
          : p
      );
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.properties));
    },

    // Favorites
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;
      if (state.favorites.includes(id)) {
        state.favorites = state.favorites.filter((fid) => fid !== id);
      } else {
        state.favorites.push(id);
      }
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(state.favorites));
    },

    // Communities
    joinCommunity(state, action: PayloadAction<string>) {
      state.communities = state.communities.map((c) =>
        c.id === action.payload ? { ...c, isJoined: true, memberCount: c.memberCount + 1 } : c
      );
      AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(state.communities));
    },

    leaveCommunity(state, action: PayloadAction<string>) {
      state.communities = state.communities.map((c) =>
        c.id === action.payload ? { ...c, isJoined: false, memberCount: Math.max(0, c.memberCount - 1) } : c
      );
      AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(state.communities));
    },

    // Posts
    addPost(state, action: PayloadAction<Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'commentCount' | 'shareCount' | 'isLiked'>>) {
      const newPost: Post = {
        ...action.payload,
        id: Date.now().toString(),
        likeCount: 0,
        commentCount: 0,
        shareCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.posts.unshift(newPost);
      AsyncStorage.setItem(POSTS_KEY, JSON.stringify(state.posts));

      // Tăng postCount của cộng đồng
      state.communities = state.communities.map((c) =>
        c.id === action.payload.communityId ? { ...c, postCount: c.postCount + 1 } : c
      );
      AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(state.communities));
    },

    togglePostLike(state, action: PayloadAction<string>) {
      state.posts = state.posts.map((p) =>
        p.id === action.payload
          ? {
              ...p,
              isLiked: !p.isLiked,
              likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      );
      AsyncStorage.setItem(POSTS_KEY, JSON.stringify(state.posts));
    },

    incrementShareCount(state, action: PayloadAction<string>) {
      state.posts = state.posts.map((p) =>
        p.id === action.payload ? { ...p, shareCount: p.shareCount + 1 } : p
      );
      AsyncStorage.setItem(POSTS_KEY, JSON.stringify(state.posts));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAppData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadAppData.fulfilled, (state, action) => {
        state.properties = action.payload.properties;
        state.favorites = action.payload.favorites;
        state.communities = action.payload.communities;
        state.posts = action.payload.posts;
        state.isLoading = false;
      })
      .addCase(loadAppData.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
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
} = appSlice.actions;

export default appSlice.reducer;