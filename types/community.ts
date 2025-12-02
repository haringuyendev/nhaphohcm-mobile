export interface Community {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  memberCount: number;
  postCount: number;
  isJoined: boolean;
  isOwned: boolean;
  createdAt: string;
  category: string;
}

export interface Post {
  id: string;
  communityId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  images?: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}
