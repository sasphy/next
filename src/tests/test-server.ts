import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';

// Import modules
import { tracksModule } from '../modules/tracks';
import { usersModule } from '../modules/users';
import { discoveryModule } from '../modules/discovery';
import { authModule } from '../modules/auth';

// Create app instance
const app = new Elysia()
  // Add plugins
  .use(swagger({
    documentation: {
      info: {
        title: 'Sasphy Music API (Test)',
        version: '1.0.0',
        description: 'API for the Sasphy Music Streaming Platform (Test Environment)'
      },
      tags: [
        { name: 'tracks', description: 'Track management endpoints' },
        { name: 'users', description: 'User management endpoints' },
        { name: 'discovery', description: 'Discovery and EV rating system' },
        { name: 'auth', description: 'Authentication endpoints' }
      ]
    }
  }))
  .use(cors())
  // Add modules
  .use(authModule)
  .use(usersModule)
  .use(tracksModule)
  .use(discoveryModule)
  // Global error handler
  .onError(({ code, error, set }) => {
    if (code === 'NOT_FOUND') {
      set.status = 404;
      return {
        success: false,
        error: 'Not Found',
        message: 'The requested resource was not found'
      };
    }
    
    if (code === 'VALIDATION') {
      set.status = 400;
      return {
        success: false,
        error: 'Validation Error',
        message: error.message
      };
    }

    // Default error handler
    set.status = 500;
    console.error(`[ERROR] ${code}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      success: false,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    };
  })
  // Start the server on port 4040
  .listen(4040);

console.log(
  `🦊 Sasphy Music API (Test Server) is running at ${app.server?.hostname}:${app.server?.port}`
);

// Export app for testing
export type App = typeof app; 