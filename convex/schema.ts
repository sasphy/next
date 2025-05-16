import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex schema for Sasphy persistent profiles
 * This schema bridges wallet addresses to persistent profiles across both
 * Sasphy (traditional streaming) and Sasphy Fiesta (tokenized NFT platform)
 */
export default defineSchema({
  // Users table - For wallet-connected profiles
  users: defineTable({
    walletAddress: v.string(), // Primary wallet address (Solana)
    username: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    email: v.optional(v.string()),
    isArtist: v.boolean(),
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
    lastLoginAt: v.number(), // Timestamp
  }).index("by_wallet", ["walletAddress"]),

  // Artists table - For creator profiles
  artists: defineTable({
    userId: v.id("users"), // Reference to users table
    artistName: v.string(),
    description: v.optional(v.string()),
    genres: v.array(v.string()),
    verified: v.boolean(),
    socialLinks: v.optional(v.object({})), // Object to store social links
    payoutWalletAddress: v.optional(v.string()), // Optional different wallet for payouts
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  }).index("by_user_id", ["userId"]),

  // Preferences table - For user settings
  preferences: defineTable({
    userId: v.id("users"), // Reference to users table
    theme: v.optional(v.string()), // light, dark, system
    autoplay: v.optional(v.boolean()),
    showExplicitContent: v.optional(v.boolean()),
    preferredGenres: v.optional(v.array(v.string())),
    language: v.optional(v.string()),
    notificationsEnabled: v.optional(v.boolean()),
    createdAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
  }).index("by_user_id", ["userId"]),

  // Owned tracks table - For references to owned tracks
  owned_tracks: defineTable({
    userId: v.id("users"), // Reference to users table
    trackType: v.string(), // "regular" or "tokenized"
    trackId: v.string(), // ID in the respective system (regular ID or NFT address)
    purchasedAt: v.number(), // Timestamp
    purchasePrice: v.optional(v.float64()), // Price paid (if applicable)
    tokenId: v.optional(v.string()), // For tokenized tracks
  }).index("by_user_id", ["userId"]),

  // Created tracks table - For references to created tracks
  created_tracks: defineTable({
    artistId: v.id("artists"), // Reference to artists table
    trackType: v.string(), // "regular" or "tokenized"
    trackId: v.string(), // ID in the respective system (regular ID or NFT address)
    title: v.string(),
    createdAt: v.number(), // Timestamp
    metadataUrl: v.string(), // IPFS URL for metadata
    tokenId: v.optional(v.string()), // For tokenized tracks
    curveType: v.optional(v.string()), // For tokenized tracks (LINEAR, EXPONENTIAL, etc.)
    published: v.boolean(),
  }).index("by_artist_id", ["artistId"]),
}); 