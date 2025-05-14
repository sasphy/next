import { Elysia, t } from 'elysia';
import type { Discovery, LeaderboardEntry, DiscoveryDTO } from '../../types';

// Mock database for discoveries
const discoveries: Discovery[] = [
  {
    userId: 'user-123',
    trackId: '1',
    discoveryPosition: 1,
    discoveredAt: '2023-05-10T12:30:00Z',
    evPoints: 150
  },
  {
    userId: 'user-456',
    trackId: '1',
    discoveryPosition: 2,
    discoveredAt: '2023-05-10T12:45:00Z',
    evPoints: 75
  },
  {
    userId: 'user-123',
    trackId: '2',
    discoveryPosition: 3,
    discoveredAt: '2023-05-11T10:15:00Z',
    evPoints: 50
  }
];

// Mock user data for leaderboard
const users: Record<string, any> = {
  'user-123': {
    id: 'user-123',
    username: 'musiclover42',
    evScore: 200,
    evRank: 'Trend Spotter',
    profileImage: 'https://placeholder.com/150'
  },
  'user-456': {
    id: 'user-456',
    username: 'beatmaster',
    evScore: 75,
    evRank: 'Rookie Scout',
    profileImage: 'https://placeholder.com/150'
  },
  'user-789': {
    id: 'user-789',
    username: 'vibeseeker',
    evScore: 350,
    evRank: 'Vibe Curator',
    profileImage: 'https://placeholder.com/150'
  }
};

// Authentication middleware (would check JWT in production)
const authenticate = (app: Elysia) => 
  app.derive(({ headers, set }) => {
    // For development only - would validate JWT token in production
    const authHeader = headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return {
        userId: '',
        isAuthenticated: false
      };
    }
    
    // Mock authentication for development
    return {
      userId: 'user-123',
      isAuthenticated: true
    };
  });

// Calculate EV points based on discovery position
const calculateEVPoints = (position: number): number => {
  // Formula: 100 points for first, decaying exponentially
  return Math.floor(100 / Math.sqrt(position));
};

// Discovery module
export const discoveryModule = new Elysia({ prefix: '/discovery' })
  // Define models for validation
  .model({
    discovery: t.Object({
      userId: t.String(),
      trackId: t.String(),
      discoveryPosition: t.Number(),
      discoveredAt: t.String(),
      evPoints: t.Number()
    }),
    createDiscovery: t.Object({
      trackId: t.String({
        error: 'Track ID is required'
      })
    }),
    leaderboardEntry: t.Object({
      userId: t.String(),
      username: t.String(),
      evScore: t.Number(),
      evRank: t.String(),
      profileImage: t.Optional(t.String())
    }),
    discoveryResponse: t.Object({
      success: t.Boolean(),
      data: t.Optional(
        t.Union([
          t.Ref('discovery'),
          t.Array(t.Ref('discovery'))
        ])
      ),
      error: t.Optional(t.String()),
      message: t.String()
    }),
    leaderboardResponse: t.Object({
      success: t.Boolean(),
      data: t.Optional(t.Array(t.Ref('leaderboardEntry'))),
      error: t.Optional(t.String()),
      message: t.String(),
      pagination: t.Optional(t.Object({
        total: t.Number(),
        page: t.Number(),
        limit: t.Number()
      }))
    })
  })
  
  // Authentication for all routes
  .use(authenticate)
  
  // Record a new discovery
  .post('/', ({ body, userId, isAuthenticated, set }) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to record discoveries'
      };
    }
    
    const { trackId } = body;
    
    // Check if user has already discovered this track
    const existingDiscovery = discoveries.find(d => 
      d.userId === userId && d.trackId === trackId
    );
    
    if (existingDiscovery) {
      set.status = 400;
      return {
        success: false,
        error: 'AlreadyDiscovered',
        message: 'You have already discovered this track'
      };
    }
    
    // Count existing discoveries for this track
    const trackDiscoveries = discoveries.filter(d => d.trackId === trackId);
    const discoveryPosition = trackDiscoveries.length + 1;
    
    // Calculate EV points based on position
    const evPoints = calculateEVPoints(discoveryPosition);
    
    // Create new discovery record
    const newDiscovery: Discovery = {
      userId,
      trackId,
      discoveryPosition,
      discoveredAt: new Date().toISOString(),
      evPoints
    };
    
    // Add to discoveries
    discoveries.push(newDiscovery);
    
    // Update user's EV score (in production, this would be a database update)
    const user = users[userId];
    if (user) {
      user.evScore += evPoints;
      
      // Update rank based on new score
      if (user.evScore >= 10000) {
        user.evRank = 'Culture Maker';
      } else if (user.evScore >= 5000) {
        user.evRank = 'Vibe Curator';
      } else if (user.evScore >= 1000) {
        user.evRank = 'Trend Spotter';
      } else {
        user.evRank = 'Rookie Scout';
      }
    }
    
    return {
      success: true,
      data: newDiscovery,
      message: `Track discovered! You earned ${evPoints} EV points.`
    };
  }, {
    body: 'createDiscovery',
    response: 'discoveryResponse'
  })
  
  // Get user's discoveries
  .get('/user', ({ userId, isAuthenticated, set, query }) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to view discoveries'
      };
    }
    
    // Get all discoveries for this user
    const userDiscoveries = discoveries.filter(d => d.userId === userId);
    
    return {
      success: true,
      data: userDiscoveries,
      message: `Found ${userDiscoveries.length} discoveries`
    };
  }, {
    response: 'discoveryResponse'
  })
  
  // Get discoveries for a specific track
  .get('/track/:trackId', ({ params, set }) => {
    const { trackId } = params;
    
    // Get all discoveries for this track
    const trackDiscoveries = discoveries
      .filter(d => d.trackId === trackId)
      .sort((a, b) => a.discoveryPosition - b.discoveryPosition);
    
    return {
      success: true,
      data: trackDiscoveries,
      message: `Found ${trackDiscoveries.length} discoveries for track`
    };
  }, {
    params: t.Object({
      trackId: t.String()
    }),
    response: 'discoveryResponse'
  })
  
  // Get global leaderboard
  .get('/leaderboard', ({ query }) => {
    const limit = Number(query?.limit || 10);
    const page = Number(query?.page || 1);
    const offset = (page - 1) * limit;
    
    // Create leaderboard entries from users
    const leaderboard: LeaderboardEntry[] = Object.values(users)
      .map(user => ({
        userId: user.id,
        username: user.username,
        evScore: user.evScore,
        evRank: user.evRank,
        profileImage: user.profileImage
      }))
      .sort((a, b) => b.evScore - a.evScore); // Sort by score descending
    
    // Paginate results
    const paginatedLeaderboard = leaderboard.slice(offset, offset + limit);
    
    return {
      success: true,
      data: paginatedLeaderboard,
      message: 'Leaderboard retrieved successfully',
      pagination: {
        total: leaderboard.length,
        page,
        limit
      }
    };
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
      page: t.Optional(t.String())
    }),
    response: 'leaderboardResponse'
  })
  
  // Get user's EV stats
  .get('/stats', ({ userId, isAuthenticated, set }) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to view stats'
      };
    }
    
    const user = users[userId];
    
    if (!user) {
      set.status = 404;
      return {
        success: false,
        error: 'UserNotFound',
        message: 'User not found'
      };
    }
    
    // Count discoveries and calculate stats
    const userDiscoveries = discoveries.filter(d => d.userId === userId);
    const totalDiscoveries = userDiscoveries.length;
    const totalPoints = userDiscoveries.reduce((sum, d) => sum + d.evPoints, 0);
    const firstDiscoveries = userDiscoveries.filter(d => d.discoveryPosition === 1).length;
    
    return {
      success: true,
      data: {
        userId,
        username: user.username,
        evScore: user.evScore,
        evRank: user.evRank,
        totalDiscoveries,
        totalPoints,
        firstDiscoveries,
        averagePoints: totalDiscoveries ? Math.round(totalPoints / totalDiscoveries) : 0
      },
      message: 'User stats retrieved successfully'
    };
  }); 