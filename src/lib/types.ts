import { PublicKey } from '@solana/web3.js';

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
