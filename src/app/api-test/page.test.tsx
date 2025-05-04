import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ApiTestPage from './page';

// Setup mock functions
const mockGetAllTracks = vi.fn();
const mockGetLeaderboard = vi.fn();

// Use hoisted mock
vi.hoisted(() => {
  // Mock the apiHelpers
  vi.mock('@/lib/api', () => {
    return {
      apiHelpers: {
        tracks: {
          getAll: mockGetAllTracks,
        },
        discovery: {
          getLeaderboard: mockGetLeaderboard,
        },
      },
    };
  });
});

describe('ApiTestPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Set up successful mock responses
    mockGetAllTracks.mockResolvedValue({
      data: {
        success: true,
        data: [
          { 
            id: '1', 
            title: 'Test Track', 
            artist: 'Test Artist', 
            price: 1.99,
            discoveryCount: 5 
          },
        ],
      },
    });
    
    mockGetLeaderboard.mockResolvedValue({
      data: {
        success: true,
        data: [
          { 
            userId: '1', 
            username: 'Test User', 
            evRank: 'Rookie Scout',
            evScore: 100 
          },
        ],
      },
    });
  });
  
  it('renders the tracks section with data', async () => {
    render(<ApiTestPage />);
    
    // Initially shows loading state
    expect(screen.getByText('Loading tracks...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test Track')).toBeInTheDocument();
    });
    
    // Check if track data is displayed correctly
    expect(screen.getByText('by Test Artist')).toBeInTheDocument();
    expect(screen.getByText('Price: $1.99 | Discoveries: 5')).toBeInTheDocument();
  });
  
  it('renders the leaderboard section with data', async () => {
    render(<ApiTestPage />);
    
    // Initially shows loading state
    expect(screen.getByText('Loading leaderboard...')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
    
    // Check if leaderboard data is displayed correctly
    expect(screen.getByText('Rank: Rookie Scout')).toBeInTheDocument();
    expect(screen.getByText('EV Score: 100')).toBeInTheDocument();
  });
  
  it('shows error message when API call fails', async () => {
    // Mock API failure
    mockGetAllTracks.mockRejectedValue(new Error('API error'));
    
    render(<ApiTestPage />);
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error connecting to API server')).toBeInTheDocument();
    });
  });
}); 