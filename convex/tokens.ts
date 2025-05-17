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
    network: v.optional(v.string()), // "mainnet" or "devnet"
    txHash: v.optional(v.string()),
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
    
    // Also save to the network-specific deployment table for persistence
    const network = args.network || "devnet"; // Default to devnet if not specified
    const deploymentData = {
      walletAddress: args.walletAddress.toLowerCase(),
      tokenAddress: args.tokenAddress || "pending",
      title: args.title,
      artist: args.artist,
      description: args.description,
      initialPrice: args.initialPrice,
      delta: args.delta,
      curveType: args.curveType,
      metadataUrl: args.metadataUrl,
      audioUrl: args.audioUrl,
      imageUrl: args.imageUrl,
      txHash: args.txHash,
      deployedAt: Date.now(),
      status: args.tokenAddress ? "succeeded" : "pending",
    };
    
    let deploymentId;
    if (network === "mainnet") {
      deploymentId = await ctx.db.insert("track_deployments_mainnet", deploymentData);
    } else {
      deploymentId = await ctx.db.insert("track_deployments_devnet", deploymentData);
    }
    
    return {
      tokenId,
      userId,
      artistId,
      deploymentId,
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
    txHash: v.optional(v.string()),
    network: v.optional(v.string()), // "mainnet" or "devnet"
  },
  handler: async (ctx, args) => {
    // Update the created_tracks record
    await ctx.db.patch(args.id, {
      trackId: args.tokenAddress,
      tokenId: args.tokenAddress,
    });
    
    // Get the track details to find and update the deployment record
    const track = await ctx.db.get(args.id);
    if (!track) {
      return { success: false, message: "Track not found" };
    }
    
    // Find the artist to get the wallet address
    const artist = await ctx.db.get(track.artistId);
    if (!artist) {
      return { success: false, message: "Artist not found" };
    }
    
    // Find the user to get the wallet address
    const user = await ctx.db.get(artist.userId);
    if (!user) {
      return { success: false, message: "User not found" };
    }
    
    const network = args.network || "devnet";
    const table = network === "mainnet" ? "track_deployments_mainnet" : "track_deployments_devnet";
    
    // Find the deployment record
    const deployment = await ctx.db
      .query(table)
      .withIndex("by_wallet", (q) => q.eq("walletAddress", user.walletAddress))
      .filter((q) => q.eq(q.field("tokenAddress"), "pending"))
      .first();
    
    if (deployment) {
      // Update the deployment record
      await ctx.db.patch(deployment._id, {
        tokenAddress: args.tokenAddress,
        txHash: args.txHash,
        status: "succeeded",
      });
    }
    
    return { success: true };
  },
});

/**
 * Get all track deployments from a specific network
 */
export const getAllDeployments = query({
  args: { 
    network: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const table = args.network === "mainnet" ? "track_deployments_mainnet" : "track_deployments_devnet";
    const limit = args.limit || 100; // Default to 100 records
    
    const deployments = await ctx.db
      .query(table)
      .order("desc")
      .take(limit);
    
    return deployments;
  },
});

/**
 * Get track deployments by wallet address
 */
export const getDeploymentsByWallet = query({
  args: { 
    walletAddress: v.string(),
    network: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedWalletAddress = args.walletAddress.toLowerCase();
    const table = args.network === "mainnet" ? "track_deployments_mainnet" : "track_deployments_devnet";
    
    const deployments = await ctx.db
      .query(table)
      .withIndex("by_wallet", (q) => q.eq("walletAddress", normalizedWalletAddress))
      .collect();
    
    return deployments;
  },
});

/**
 * Get a specific track deployment by token address
 */
export const getDeploymentByToken = query({
  args: { 
    tokenAddress: v.string(),
    network: v.string(),
  },
  handler: async (ctx, args) => {
    const table = args.network === "mainnet" ? "track_deployments_mainnet" : "track_deployments_devnet";
    
    const deployment = await ctx.db
      .query(table)
      .withIndex("by_token", (q) => q.eq("tokenAddress", args.tokenAddress))
      .first();
    
    return deployment;
  },
}); 