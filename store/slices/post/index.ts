// store/slices/post.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mockPosts } from "@/mocks/data";
import { Post } from "@/types/community";
import { incrementCommunityPostCount } from "../community";

const POSTS_KEY = "@binhthanh_posts";

interface AddPostPayload {
  communityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images?: string[];
}

// ======================================
// 1️⃣ LOAD POSTS từ ASYNC STORAGE
// ======================================
export const loadPosts = createAsyncThunk(
  "posts/load",
  async () => {
    const stored = await AsyncStorage.getItem(POSTS_KEY);

    if (stored) return JSON.parse(stored);

    // fallback: mock
    await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(mockPosts));
    return mockPosts;
  }
);


// Tạo bài viết + tăng postCount community
export const addPostThunk = createAsyncThunk(
  "posts/addPostThunk",
  async (data: AddPostPayload, { dispatch }) => {
    const newPost: Post = {
      ...data,
      id: Date.now().toString(),
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Thêm bài viết
    dispatch(addPost(newPost));

    // Tăng số bài viết của community
    dispatch(incrementCommunityPostCount(data.communityId));

    return newPost;
  }
);


// ======================================
// Helper lưu AsyncStorage
// ======================================
const saveToStorage = async (list: Post[]) => {
  await AsyncStorage.setItem(POSTS_KEY, JSON.stringify(list));
};

// ======================================
// State
// ======================================
interface PostState {
  items: Post[];
  isLoading: boolean;
}

const initialState: PostState = {
  items: mockPosts,
  isLoading: true,
};

export const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // ===============================
    // Thêm bài viết mới
    // ===============================
    addPost(state, action: PayloadAction<Post>) {
      state.items.unshift(action.payload);
      saveToStorage(state.items);
    },

    // ===============================
    // Like / Unlike
    // ===============================
    togglePostLike(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.items = state.items.map((p) =>
        p.id === id
          ? {
              ...p,
              isLiked: !p.isLiked,
              likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
            }
          : p
      );

      saveToStorage(state.items);
    },

    // ===============================
    // Share +1
    // ===============================
    incrementShareCount(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.items = state.items.map((p) =>
        p.id === id ? { ...p, shareCount: p.shareCount + 1 } : p
      );

      saveToStorage(state.items);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadPosts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadPosts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(addPostThunk.fulfilled, (state, action) => {
        // addPostThunk đã xử lý logic,
        // reducer này chỉ cần thêm post vào list
        state.items.unshift(action.payload);
        saveToStorage(state.items);
      });
  },
});

// EXPORT reducer actions
export const { addPost, togglePostLike, incrementShareCount } =
  postSlice.actions;

export default postSlice.reducer;
