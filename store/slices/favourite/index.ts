// store/slices/favourite.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@binhthanh_favorites";

// ======================================
// 1️⃣ LOAD FAVORITES từ ASYNC STORAGE
// ======================================
export const loadFavorites = createAsyncThunk(
  "favorites/load",
  async () => {
    const stored = await AsyncStorage.getItem(FAVORITES_KEY);

    if (stored) return JSON.parse(stored);

    // fallback: danh sách rỗng
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify([]));
    return [];
  }
);

// ======================================
// Helper lưu xuống AsyncStorage
// ======================================
const saveToStorage = async (list: string[]) => {
  await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
};

// ======================================
// Slice
// ======================================
interface FavoritesState {
  ids: string[];
  isLoading: boolean;
}

const initialState: FavoritesState = {
  ids: [],
  isLoading: true,
};

export const favouriteSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<string>) {
      const id = action.payload;

      if (state.ids.includes(id)) {
        state.ids = state.ids.filter((fid) => fid !== id);
      } else {
        state.ids.push(id);
      }

      // LƯU XUỐNG ASYNC STORAGE (KHÔNG đưa vào reducer)
      saveToStorage(state.ids);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadFavorites.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadFavorites.fulfilled, (state, action) => {
        state.ids = action.payload;
        state.isLoading = false;
      });
  },
});

export const { toggleFavorite } = favouriteSlice.actions;

export default favouriteSlice.reducer;
