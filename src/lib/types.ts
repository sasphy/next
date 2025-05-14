import { PublicKey } from '@solana/web3.js';

export type PlaylistType = 'discover' | 'trending' | 'favorites' | 'recent' | 'custom' | 'artist' | 'genre';

export interface Track {
  id: string;
  title: string;
  artist: string;
  description?: string;
  coverImage: string;
  previewUrl: string;
  fullAudioUrl?: string;
  price: string;
  priceLabel?: string;
  tokenId?: number;
  mintAddress?: string;
  editionCount?: number;
  maxEditions?: number;
  created?: string;
  updated?: string;
  genre?: string;
  duration?: number;
  isOwned?: boolean;
  artistId?: string;
  artistAddress?: string;
  likeCount?: number;
  playCount?: number;
  collectionCount?: number;
  releaseDate?: string;
  isExplicit?: boolean;
  bpm?: number;
  key?: string;
  isVerified?: boolean;
  tags?: string[];
}

export interface User {
  id: string;
  address: string;
  username?: string;
  profileImage?: string;
  evScore?: number;
  discoveryCount?: number;
  ownedTracks?: number[];
  created?: string;
  updated?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    discord?: string;
    tiktok?: string;
  };
  isArtist?: boolean;
  followers?: number;
  following?: number;
  influenceScore?: number;
  badges?: string[];
  totalPlays?: number;
}

export interface Artist extends User {
  isArtist: true;
  genres?: string[];
  trackCount: number;
  popularity: number;
  collectionAddress?: string;
  verifiedArtist: boolean;
  artistBio?: string;
  featuredTrackId?: string;
  featuredTrack?: Track;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  creatorId: string;
  creator: User;
  trackCount: number;
  tracks?: Track[];
  isPublic: boolean;
  created: string;
  updated: string;
  playCount?: number;
  followers?: number;
  type: PlaylistType;
  durationSeconds?: number;
}

export interface SearchResults {
  tracks?: Track[];
  artists?: Artist[];
  playlists?: Playlist[];
  totalResults: number;
}

export interface NonceResponse {
  nonce: string;
  address: string;
  expiresAt: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface PurchaseResponse {
  success: boolean;
  transaction?: string;
  transactionUrl?: string;
  tokenId?: number;
  edition?: number;
  mint?: string;
}

export interface StreamUrlResponse {
  url: string;
  expiresAt: number;
}

export interface TokenOwnership {
  owned: boolean;
  count: number;
  editions?: number[];
  mintAddress?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Solana-specific types
export interface SolanaMintMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  animation_url?: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
      cdn?: boolean;
    }>;
    category?: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
}

export interface SolanaEdition {
  masterEdition: {
    address: PublicKey;
    uri: string;
    name: string;
    symbol: string;
  };
  printEdition: {
    address: PublicKey;
    edition: number;
  };
}
