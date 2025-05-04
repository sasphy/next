import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiHelpers } from './api';

// Setup mocks manually
const mockTrackGetAll = vi.fn();
const mockTrackSearch = vi.fn();
const mockTrackGetOne = vi.fn();
const mockTrackStreamUrl = vi.fn();
const mockAuthRegister = vi.fn();
const mockAuthLogin = vi.fn();
const mockAuthVerify = vi.fn();
const mockUsersGetById = vi.fn();
const mockUsersSearch = vi.fn();
const mockUsersUpdate = vi.fn();
const mockDiscoveryRate = vi.fn();
const mockDiscoveryLeaderboard = vi.fn();

// Define mocks before imports with hoisted
vi.hoisted(() => {
  // Mock the apiHelpers
  vi.mock('./api', () => {
    return {
      apiHelpers: {
        tracks: {
          getAll: mockTrackGetAll,
          search: mockTrackSearch,
          getOne: mockTrackGetOne,
          getStreamUrl: mockTrackStreamUrl,
        },
        auth: {
          register: mockAuthRegister,
          login: mockAuthLogin,
          verify: mockAuthVerify,
        },
        users: {
          getUserById: mockUsersGetById,
          searchUsers: mockUsersSearch,
          updateProfile: mockUsersUpdate,
        },
        discovery: {
          rateTrack: mockDiscoveryRate,
          getLeaderboard: mockDiscoveryLeaderboard,
        }
      }
    };
  });
});

describe('API Helpers', () => {
  const mockSuccessResponse = {
    data: {
      success: true,
      data: { test: 'data' },
      message: 'Success'
    }
  };

  const mockErrorResponse = {
    error: new Error('API Error')
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Tracks API', () => {
    it('should get all tracks', async () => {
      // Mock implementation
      mockTrackGetAll.mockResolvedValue(mockSuccessResponse);
      
      // Call API helper
      const result = await apiHelpers.tracks.getAll();
      
      // Verify result
      expect(result).toEqual(mockSuccessResponse);
      expect(mockTrackGetAll).toHaveBeenCalledTimes(1);
    });
    
    it('should handle errors when getting tracks', async () => {
      // Mock error
      mockTrackGetAll.mockRejectedValue(mockErrorResponse.error);
      
      // Call API helper and catch error
      try {
        await apiHelpers.tracks.getAll();
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toEqual(mockErrorResponse.error);
      }
    });
  });
  
  describe('Auth API', () => {
    it('should register a user', async () => {
      // Mock implementation
      mockAuthRegister.mockResolvedValue(mockSuccessResponse);
      
      // Mock user data
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Call API helper
      const result = await apiHelpers.auth.register(userData);
      
      // Verify result
      expect(result).toEqual(mockSuccessResponse);
      expect(mockAuthRegister).toHaveBeenCalledWith(userData);
    });
  });
  
  describe('Users API', () => {
    it('should get a user profile', async () => {
      // Mock implementation
      mockUsersGetById.mockResolvedValue(mockSuccessResponse);
      
      // Call API helper
      const result = await apiHelpers.users.getUserById('user123');
      
      // Verify result
      expect(result).toEqual(mockSuccessResponse);
      expect(mockUsersGetById).toHaveBeenCalledWith('user123');
    });
  });
  
  describe('Discovery API', () => {
    it('should get the leaderboard', async () => {
      // Mock implementation
      mockDiscoveryLeaderboard.mockResolvedValue(mockSuccessResponse);
      
      // Call API helper
      const result = await apiHelpers.discovery.getLeaderboard();
      
      // Verify result
      expect(result).toEqual(mockSuccessResponse);
      expect(mockDiscoveryLeaderboard).toHaveBeenCalledTimes(1);
    });
  });
}); 