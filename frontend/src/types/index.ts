// src/types/index.ts
export interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
}

export interface Place {
  id: number;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  imageUrls: string[];
  userId?: number;
}

export interface Review {
  id: number;
  placeId: number;
  userId: number;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: string;
  likesCount: number;
  likedByUserIds: number[];
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
}