// Base response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  evScore: number;
  evRank: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

// Track types
export interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  previewUrl: string;
  price: number;
  discoveryCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrackDTO {
  title: string;
  artist: string;
  price: number;
}

// Discovery types
export interface Discovery {
  userId: string;
  trackId: string;
  discoveryPosition: number; // 1st, 2nd, 3rd, etc.
  discoveredAt: string;
  evPoints: number;
}

export interface DiscoveryDTO {
  trackId: string;
}

// EV Rank types
export enum EVRank {
  ROOKIE_SCOUT = 'Rookie Scout',
  TREND_SPOTTER = 'Trend Spotter',
  VIBE_CURATOR = 'Vibe Curator',
  CULTURE_MAKER = 'Culture Maker',
  VIRAL_WHISPERER = 'Viral Whisperer'
}

// Leaderboard entry
export interface LeaderboardEntry {
  userId: string;
  username: string;
  evScore: number;
  evRank: EVRank;
  profileImage?: string;
} 