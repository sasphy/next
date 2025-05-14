import { Elysia, t } from 'elysia';
import type { User } from '../../types';

// Mock user database (replace with actual DB in production)
const users: Record<string, Omit<User, 'password'>> = {
  'user-123': {
    id: 'user-123',
    username: 'musiclover42',
    email: 'user123@example.com',
    profileImage: 'https://placeholder.com/150',
    evScore: 200,
    evRank: 'Trend Spotter',
    createdAt: '2023-01-15T10:30:00Z',
    updatedAt: '2023-05-20T14:25:00Z'
  },
  'user-456': {
    id: 'user-456',
    username: 'beatmaster',
    email: 'user456@example.com',
    profileImage: 'https://placeholder.com/150',
    evScore: 75,
    evRank: 'Rookie Scout',
    createdAt: '2023-02-20T08:15:00Z',
    updatedAt: '2023-05-18T16:40:00Z'
  },
  'user-789': {
    id: 'user-789',
    username: 'vibeseeker',
    email: 'user789@example.com',
    profileImage: 'https://placeholder.com/150',
    evScore: 350,
    evRank: 'Vibe Curator',
    createdAt: '2023-03-05T12:45:00Z',
    updatedAt: '2023-05-22T09:10:00Z'
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

// Users module
export const usersModule = new Elysia({ prefix: '/users' })
  // Define models for validation
  .model({
    user: t.Object({
      id: t.String(),
      username: t.String(),
      email: t.String(),
      profileImage: t.Optional(t.String()),
      evScore: t.Number(),
      evRank: t.String(),
      createdAt: t.String(),
      updatedAt: t.String()
    }),
    updateProfile: t.Object({
      username: t.Optional(t.String({
        minLength: 3,
        error: 'Username must be at least 3 characters'
      })),
      profileImage: t.Optional(t.String())
    }),
    userResponse: t.Object({
      success: t.Boolean(),
      data: t.Optional(t.Union([
        t.Ref('user'),
        t.Array(t.Ref('user'))
      ])),
      error: t.Optional(t.String()),
      message: t.String(),
      pagination: t.Optional(t.Object({
        total: t.Number(),
        page: t.Number(),
        limit: t.Number()
      }))
    })
  })
  
  // Get user by ID (public profile)
  .get('/:id', ({ params, set }) => {
    const { id } = params;
    const user = users[id];
    
    if (!user) {
      set.status = 404;
      return {
        success: false,
        error: 'UserNotFound',
        message: 'User not found'
      };
    }
    
    return {
      success: true,
      data: user,
      message: 'User profile retrieved successfully'
    };
  }, {
    params: t.Object({
      id: t.String()
    }),
    response: 'userResponse'
  })
  
  // Search users
  .get('/search', ({ query }) => {
    const { q = '', limit = '10', page = '1' } = query;
    const searchTerm = q.toLowerCase();
    const limitNum = Number(limit);
    const pageNum = Number(page);
    const offset = (pageNum - 1) * limitNum;
    
    // Filter users by search term
    const filteredUsers = Object.values(users).filter(user => 
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
    
    // Paginate results
    const paginatedUsers = filteredUsers.slice(offset, offset + limitNum);
    
    return {
      success: true,
      data: paginatedUsers,
      message: `Found ${filteredUsers.length} users matching "${q}"`,
      pagination: {
        total: filteredUsers.length,
        page: pageNum,
        limit: limitNum
      }
    };
  }, {
    query: t.Object({
      q: t.Optional(t.String()),
      limit: t.Optional(t.String()),
      page: t.Optional(t.String())
    }),
    response: 'userResponse'
  })
  
  // Update user profile (authenticated)
  .use(authenticate)
  .patch('/profile', ({ body, userId, isAuthenticated, set }) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to update profile'
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
    
    // Update user properties
    const updatedUser = {
      ...user,
      ...(body.username && { username: body.username }),
      ...(body.profileImage && { profileImage: body.profileImage }),
      updatedAt: new Date().toISOString()
    };
    
    // Save updated user
    users[userId] = updatedUser;
    
    return {
      success: true,
      data: updatedUser,
      message: 'Profile updated successfully'
    };
  }, {
    body: 'updateProfile',
    response: 'userResponse'
  })
  
  // Get top users (by EV score)
  .get('/top', ({ query }) => {
    const limit = Number(query?.limit || 10);
    
    // Sort users by EV score descending
    const topUsers = Object.values(users)
      .sort((a, b) => b.evScore - a.evScore)
      .slice(0, limit);
    
    return {
      success: true,
      data: topUsers,
      message: `Top ${topUsers.length} users retrieved successfully`
    };
  }, {
    query: t.Object({
      limit: t.Optional(t.String())
    }),
    response: 'userResponse'
  })
  
  // Get current user profile (authenticated)
  .get('/me', ({ userId, isAuthenticated, set }) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required to view profile'
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
    
    return {
      success: true,
      data: user,
      message: 'User profile retrieved successfully'
    };
  }, {
    response: 'userResponse'
  }); 