// store/slices/community.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockCommunities } from "@/mocks/data";
import { Community } from "@/types/community";

const COMMUNITIES_KEY = "@binhthanh_communities";

// ======================================
// 1️⃣ LOAD COMMUNITIES từ ASYNC STORAGE
// ======================================
export const loadCommunities = createAsyncThunk(
  "communities/load",
  async () => {
    const stored = await AsyncStorage.getItem(COMMUNITIES_KEY);

    if (stored) return JSON.parse(stored);

    // fallback: lưu mock xuống storage
    await AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(mockCommunities));
    return mockCommunities;
  }
);

// ======================================
// Helper lưu lại AsyncStorage
// ======================================
const saveToStorage = async (list: Community[]) => {
  await AsyncStorage.setItem(COMMUNITIES_KEY, JSON.stringify(list));
};

// ======================================
// Slice
// ======================================
interface CommunitiesState {
  items: Community[];
  isLoading: boolean;
}

const initialState: CommunitiesState = {
  items: mockCommunities,
  isLoading: true,
};

export const communitySlice = createSlice({
  name: "communities",
  initialState,
  reducers: {
    joinCommunity(state, action: PayloadAction<string>) {
      const id = action.payload;

      state.items = state.items.map((c) =>
        c.id === id
          ? { ...c, isJoined: true, memberCount: c.memberCount + 1 }
          : c
      );

      saveToStorage(state.items);
    },

    leaveCommunity(state, action: PayloadAction<string>) {
      const id = action.payload;

      state.items = state.items.map((c) =>
        c.id === id
          ? {
              ...c,
              isJoined: false,
              memberCount: Math.max(0, c.memberCount - 1),
            }
          : c
      );

      saveToStorage(state.items);
    },

    incrementCommunityPostCount(state, action: PayloadAction<string>) {
      const id = action.payload;

      state.items = state.items.map((c) =>
        c.id === id ? { ...c, postCount: c.postCount + 1 } : c
      );

      saveToStorage(state.items);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadCommunities.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadCommunities.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      });
  },
});

export const {
  joinCommunity,
  leaveCommunity,
  incrementCommunityPostCount,
} = communitySlice.actions;

export default communitySlice.reducer;
