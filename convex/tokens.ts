import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Save a token to the database
 */
export const saveToken = mutation({
  args: {
    title: v.string(),
    artist: v.string(),
    description: v.string(),
    initialPrice: v.float64(),
    delta: v.float64(),
    curveType: v.string(),
    metadataUrl: v.string(),
    audioUrl: v.string(),
    imageUrl: v.string(),
    tokenAddress: v.optional(v.string()),
    walletAddress: v.string(),
  },
  handler: async (ctx, args) => {
    // First, check if we can find the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", args.walletAddress.toLowerCase()))
      .first();
    
    // If user doesn't exist, create one
    const userId = user?._id || await ctx.db.insert("users", {
      walletAddress: args.walletAddress.toLowerCase(),
      username: args.artist,
      displayName: args.artist,
      bio: "",
      isArtist: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLoginAt: Date.now(),
    });
    
    // Look up the artist record
    let artistId = null;
    const artistRecord = user ? await ctx.db
      .query("artists")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first() : null;
    
    // If artist doesn't exist but user does, create artist record
    if (!artistRecord) {
      artistId = await ctx.db.insert("artists", {
        userId: userId,
        artistName: args.artist,
        description: "",
        genres: ["music"],
        verified: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else {
      artistId = artistRecord._id;
    }
    
    // Now create the track record
    const tokenId = await ctx.db.insert("created_tracks", {
      artistId: artistId,
      trackType: "tokenized",
      trackId: args.tokenAddress || "pending", // Handle case for pending token addresses
      title: args.title,
      createdAt: Date.now(),
      metadataUrl: args.metadataUrl,
      tokenId: args.tokenAddress || "pending",
      curveType: args.curveType,
      published: true,
    });
    
    return {
      tokenId,
      userId,
      artistId,
    };
  },
});

/**
 * Get tokens created by a wallet address
 */
export const getByWalletAddress = query({
  args: { walletAddress: v.string() },
  handler: async (ctx, args) => {
    // Normalize the wallet address (to lowercase)
    const normalizedWalletAddress = args.walletAddress.toLowerCase();
    
    // First get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedWalletAddress))
      .first();
    
    if (!user) {
      return [];
    }
    
    // Then get the artist
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_user_id", (q) => q.eq("userId", user._id))
      .first();
    
    if (!artist) {
      return [];
    }
    
    // Finally get all created tracks
    const tokens = await ctx.db
      .query("created_tracks")
      .withIndex("by_artist_id", (q) => q.eq("artistId", artist._id))
      .collect();
    
    return tokens;
  },
});

/**
 * Update a token with a generated token address
 */
export const updateTokenAddress = mutation({
  args: {
    id: v.id("created_tracks"),
    tokenAddress: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      trackId: args.tokenAddress,
      tokenId: args.tokenAddress,
    });
    
    return { success: true };
  },
}); 