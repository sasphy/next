import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get a user by wallet address
 * This is the key function for connecting wallet addresses to profiles
 */
export const getByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    // Normalize the wallet address (to lowercase)
    const normalizedWalletAddress = args.walletAddress.toLowerCase();
    
    // Find user with this wallet address
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedWalletAddress))
      .first();
    
    return user;
  },
});

/**
 * Get a user by ID
 */
export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

/**
 * Create or update a user profile when a wallet connects
 * This is called when a wallet connects to the app
 */
export const upsertUserFromWallet = mutation({
  args: {
    walletAddress: v.string(),
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Normalize the wallet address (to lowercase)
    const normalizedWalletAddress = args.walletAddress.toLowerCase();
    
    // Check if user exists with this wallet address
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedWalletAddress))
      .first();
    
    const now = Date.now();
    
    if (existingUser) {
      // Update existing user
      return await ctx.db.patch(existingUser._id, {
        lastLoginAt: now,
        updatedAt: now,
        ...(args.username && { username: args.username }),
        ...(args.displayName && { displayName: args.displayName }),
      });
    } else {
      // Create new user
      return await ctx.db.insert("users", {
        walletAddress: normalizedWalletAddress,
        username: args.username || `user_${normalizedWalletAddress.substring(0, 8)}`,
        displayName: args.displayName || `User ${normalizedWalletAddress.substring(0, 6)}`,
        isArtist: false,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
    }
  },
});

/**
 * Update a user profile
 */
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    username: v.optional(v.string()),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bannerUrl: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Update the user
    return await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Make a user an artist
 */
export const becomeArtist = mutation({
  args: {
    userId: v.id("users"),
    artistName: v.string(),
    description: v.optional(v.string()),
    genres: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, artistName, description, genres } = args;
    
    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Update user to be an artist
    await ctx.db.patch(userId, {
      isArtist: true,
      updatedAt: Date.now(),
    });
    
    // Check if artist profile already exists
    const existingArtist = await ctx.db
      .query("artists")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    
    const now = Date.now();
    
    if (existingArtist) {
      // Update existing artist profile
      return await ctx.db.patch(existingArtist._id, {
        artistName,
        description,
        genres,
        updatedAt: now,
      });
    } else {
      // Create new artist profile
      return await ctx.db.insert("artists", {
        userId,
        artistName,
        description: description || "",
        genres,
        verified: false,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

/**
 * Record a track ownership
 * This tracks which users own which tracks (both regular and tokenized)
 */
export const recordOwnedTrack = mutation({
  args: {
    userId: v.id("users"),
    trackType: v.string(), // "regular" or "tokenized"
    trackId: v.string(), // ID in the respective system
    purchasedAt: v.number(), // Timestamp
    purchasePrice: v.optional(v.number()), // Price paid
    tokenId: v.optional(v.string()), // For tokenized tracks
  },
  handler: async (ctx, args) => {
    const { userId, trackType, trackId, purchasedAt, purchasePrice, tokenId } = args;
    
    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Check if track ownership already recorded
    const existingOwnership = await ctx.db
      .query("owned_tracks")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .filter((q) => q.and(
        q.eq(q.field("trackType"), trackType),
        q.eq(q.field("trackId"), trackId)
      ))
      .first();
    
    if (existingOwnership) {
      // Update existing ownership record
      return await ctx.db.patch(existingOwnership._id, {
        purchasedAt, // Update purchase timestamp
        ...(purchasePrice !== undefined && { purchasePrice }),
      });
    } else {
      // Create new ownership record
      return await ctx.db.insert("owned_tracks", {
        userId,
        trackType,
        trackId,
        purchasedAt,
        purchasePrice,
        tokenId,
      });
    }
  },
});

/**
 * Record a created track
 * This tracks which users created which tracks (both regular and tokenized)
 */
export const recordCreatedTrack = mutation({
  args: {
    userId: v.id("users"),
    trackType: v.string(), // "regular" or "tokenized"
    trackId: v.string(), // ID in the respective system
    name: v.string(),
    description: v.optional(v.string()),
    metadataUrl: v.string(), // IPFS URL for metadata
    tokenId: v.optional(v.string()), // For tokenized tracks
    curveType: v.optional(v.string()), // For tokenized tracks
  },
  handler: async (ctx, args) => {
    const { userId, trackType, trackId, name, description, metadataUrl, tokenId, curveType } = args;
    
    // Check if user exists
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    // Find artist profile
    let artistId = null;
    const artistProfile = await ctx.db
      .query("artists")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .first();
    
    if (artistProfile) {
      artistId = artistProfile._id;
    } else {
      // If not an artist yet, create artist profile
      if (!user.isArtist) {
        await ctx.db.patch(userId, {
          isArtist: true,
          updatedAt: Date.now(),
        });
      }
      
      // Create default artist profile
      artistId = await ctx.db.insert("artists", {
        userId,
        artistName: user.displayName || user.username,
        description: "",
        genres: ["Other"],
        verified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
    
    // Check if track already recorded
    const existingTrack = await ctx.db
      .query("created_tracks")
      .withIndex("by_artist_id", (q) => q.eq("artistId", artistId))
      .filter((q) => q.and(
        q.eq(q.field("trackType"), trackType),
        q.eq(q.field("trackId"), trackId)
      ))
      .first();
    
    if (existingTrack) {
      // Update existing track record
      return await ctx.db.patch(existingTrack._id, {
        title: name,
        ...(description && { description }),
        ...(metadataUrl && { metadataUrl }),
        ...(tokenId && { tokenId }),
        ...(curveType && { curveType }),
      });
    } else {
      // Create new track record
      return await ctx.db.insert("created_tracks", {
        artistId,
        trackType,
        trackId,
        title: name,
        createdAt: Date.now(),
        metadataUrl,
        tokenId,
        curveType,
        published: true,
      });
    }
  },
}); 