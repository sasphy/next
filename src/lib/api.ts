import { treaty } from '@elysiajs/eden';
import type { App } from '../../../music-streaming-server/src/index';
import { z } from 'zod';

// Define the base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (
  typeof window === 'undefined' 
    ? 'http://localhost:3000' 
    : `${window.location.origin}/api`
);

// Create the Eden treaty client for type-safe API calls
export const api = treaty<App>(API_BASE_URL);

// Zod schemas for data validation
export const schemas = {
  // User schemas
  userLogin: z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  
  userRegister: z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  
  // Track schemas
  createTrack: z.object({
    title: z.string().min(1, 'Title is required'),
    artist: z.string().min(1, 'Artist is required'),
    price: z.number().min(0, 'Price must be 0 or higher'),
  }),
  
  // Discovery schemas
  recordDiscovery: z.object({
    trackId: z.string().min(1, 'Track ID is required'),
  }),
};

// Helper functions for common API operations
export const apiHelpers = {
  // Auth helpers
  auth: {
    login: async (data: z.infer<typeof schemas.userLogin>) => {
      const validData = schemas.userLogin.parse(data);
      return api.auth.login.post({ body: validData });
    },
    
    register: async (data: z.infer<typeof schemas.userRegister>) => {
      const validData = schemas.userRegister.parse(data);
      return api.auth.register.post({ body: validData });
    },
    
    getProfile: async (token: string) => {
      return api.auth.me.get({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
  
  // Tracks helpers
  tracks: {
    getAll: async (page = 1, limit = 10) => {
      return api.tracks.index.get({
        query: { page: `${page}`, limit: `${limit}` },
      });
    },
    
    getById: async (trackId: string) => {
      return api.tracks[':id'].get({
        params: { id: trackId },
      });
    },
    
    search: async (query: string, page = 1, limit = 10) => {
      return api.tracks.search.get({
        query: { q: query, page: `${page}`, limit: `${limit}` },
      });
    },
    
    getStreamUrl: async (trackId: string, token: string) => {
      return api.tracks[':id'].stream.get({
        params: { id: trackId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    
    getPreviewUrl: async (trackId: string) => {
      return api.tracks[':id'].preview.get({
        params: { id: trackId },
      });
    },
    
    createTrack: async (data: z.infer<typeof schemas.createTrack>, token: string) => {
      const validData = schemas.createTrack.parse(data);
      return api.tracks.index.post({
        body: validData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
  
  // Discovery helpers
  discovery: {
    recordDiscovery: async (data: z.infer<typeof schemas.recordDiscovery>, token: string) => {
      const validData = schemas.recordDiscovery.parse(data);
      return api.discovery.index.post({
        body: validData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    
    getUserDiscoveries: async (token: string) => {
      return api.discovery.user.get({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    
    getLeaderboard: async (page = 1, limit = 10) => {
      return api.discovery.leaderboard.get({
        query: { page: `${page}`, limit: `${limit}` },
      });
    },
    
    getUserStats: async (token: string) => {
      return api.discovery.stats.get({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
  
  // Users helpers
  users: {
    getUserById: async (userId: string) => {
      return api.users[':id'].get({
        params: { id: userId },
      });
    },
    
    searchUsers: async (query: string, page = 1, limit = 10) => {
      return api.users.search.get({
        query: { q: query, page: `${page}`, limit: `${limit}` },
      });
    },
    
    updateProfile: async (data: { username?: string, profileImage?: string }, token: string) => {
      return api.users.profile.patch({
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    
    getTopUsers: async (limit = 10) => {
      return api.users.top.get({
        query: { limit: `${limit}` },
      });
    },
    
    getCurrentUser: async (token: string) => {
      return api.users.me.get({
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
  },
}; 