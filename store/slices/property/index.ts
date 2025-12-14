// store/slices/property.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockProperties } from "@/mocks/data";
import { Property } from "@/types/property";

const STORAGE_KEY = "@binhthanh_properties";

// Load từ AsyncStorage
export const loadProperties = createAsyncThunk(
  "properties/load",
  async () => {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    // nếu chưa có thì lưu mock xuống storage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockProperties));
    return mockProperties;
  }
);

// Middleware helper để lưu về AsyncStorage
const saveToStorage = async (properties: Property[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(properties));
};

interface State {
  items: Property[];
  isLoading: boolean;
}

const initialState: State = {
  items: mockProperties,
  isLoading: true,
};

export const propertySlice = createSlice({
  name: "properties",
  initialState,
  reducers: {
    addProperty(state, action) {
      const property = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        viewCount: 0,
      };

      state.items.unshift(property);

      saveToStorage(state.items); // LƯU XUỐNG ASYNC STORAGE
    },

    updateProperty(state, action) {
      const { id, updates } = action.payload;

      state.items = state.items.map((p) =>
        p.id === id
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      );

      saveToStorage(state.items);
    },

    deleteProperty(state, action) {
      state.items = state.items.filter((p) => p.id !== action.payload);
      saveToStorage(state.items);
    },

    pushProperty(state, action) {
      state.items = state.items.map((p) =>
        p.id === action.payload
          ? {
              ...p,
              lastPushedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : p
      );

      saveToStorage(state.items);
    },

    upgradeToVIP(state, action) {
      const { id, days } = action.payload;

      const vipExpiry = new Date();
      vipExpiry.setDate(vipExpiry.getDate() + days);

      state.items = state.items.map((p) =>
        p.id === id
          ? {
              ...p,
              isVIP: true,
              vipExpiryDate: vipExpiry.toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : p
      );

      saveToStorage(state.items);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadProperties.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadProperties.fulfilled, (state, action) => {
        state.items = action.payload;
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
} = propertySlice.actions;

export default propertySlice.reducer;
