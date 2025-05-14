import { Elysia, t } from 'elysia';
import { jwt } from '@elysiajs/jwt';
import { CreateUserDTO, AuthResponse } from '../../types';

// Mock user database (replace with actual DB in production)
const users: Record<string, any> = {};

export const authModule = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'super-secret-jwt-token',
    })
  )
  .model({
    signUp: t.Object({
      username: t.String({
        minLength: 3,
        error: 'Username must be at least 3 characters',
      }),
      email: t.String({
        format: 'email',
        error: 'Valid email is required',
      }),
      password: t.String({
        minLength: 8,
        error: 'Password must be at least 8 characters',
      }),
    }),
    signIn: t.Object({
      email: t.String({
        format: 'email',
        error: 'Valid email is required',
      }),
      password: t.String(),
    }),
    authResponse: t.Object({
      success: t.Boolean(),
      data: t.Optional(
        t.Object({
          user: t.Object({
            id: t.String(),
            username: t.String(),
            email: t.String(),
            evScore: t.Number(),
            evRank: t.String(),
            profileImage: t.Optional(t.String()),
            createdAt: t.String(),
            updatedAt: t.String(),
          }),
          token: t.String(),
        })
      ),
      error: t.Optional(t.String()),
      message: t.String(),
    }),
  })
  .post(
    '/register',
    async ({ body, set, jwt }) => {
      const { username, email, password } = body;

      // Check if user exists
      if (Object.values(users).some((user) => user.email === email)) {
        set.status = 400;
        return {
          success: false,
          error: 'UserExists',
          message: 'User with this email already exists',
        };
      }

      // In production, hash the password with bcrypt
      // For now, we'll just store the plain password
      const newUser = {
        id: crypto.randomUUID(),
        username,
        email,
        password, // Would be hashed in production
        evScore: 0,
        evRank: 'Rookie Scout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store user
      users[newUser.id] = newUser;

      // Generate JWT
      const token = await jwt.sign({
        userId: newUser.id,
        username: newUser.username,
      });

      // Return user data (excluding password) and token
      const { password: _, ...userWithoutPassword } = newUser;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
        message: 'User registered successfully',
      };
    },
    {
      body: 'signUp',
      response: 'authResponse',
    }
  )
  .post(
    '/login',
    async ({ body, set, jwt }) => {
      const { email, password } = body;

      // Find user by email
      const user = Object.values(users).find((u) => u.email === email);

      // Check if user exists and password matches
      if (!user || user.password !== password) {
        set.status = 401;
        return {
          success: false,
          error: 'InvalidCredentials',
          message: 'Invalid email or password',
        };
      }

      // Generate JWT
      const token = await jwt.sign({
        userId: user.id,
        username: user.username,
      });

      // Return user data (excluding password) and token
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token,
        },
        message: 'Login successful',
      };
    },
    {
      body: 'signIn',
      response: 'authResponse',
    }
  )
  .get('/me', async ({ jwt, headers, set }) => {
    const authHeader = headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      set.status = 401;
      return {
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required',
      };
    }

    const token = authHeader.split(' ')[1];
    const payload = await jwt.verify(token);

    if (!payload || !payload.userId) {
      set.status = 401;
      return {
        success: false,
        error: 'InvalidToken',
        message: 'Invalid or expired token',
      };
    }

    const user = users[payload.userId];

    if (!user) {
      set.status = 404;
      return {
        success: false,
        error: 'UserNotFound',
        message: 'User not found',
      };
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        user: userWithoutPassword,
      },
      message: 'User details retrieved successfully',
    };
  }); 