import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Create a proxy Elysia app that forwards requests to our backend server
const app = new Elysia({ prefix: '/api' })
  .use(cors())
  .get('/*', async ({ request, path }) => {
    // Extract the path without the /api prefix
    const targetPath = path.replace(/^\/api/, '');
    
    // Build the target URL
    const targetUrl = `${API_URL}${targetPath}${request.url.includes('?') 
      ? request.url.substring(request.url.indexOf('?')) 
      : ''}`;
    
    console.log(`Proxying GET request to: ${targetUrl}`);
    
    try {
      // Forward the request to the backend API
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          ...Object.fromEntries(request.headers),
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API proxy error:', error);
      return {
        success: false,
        error: 'ProxyError',
        message: 'Failed to connect to API server'
      };
    }
  })
  .post('/*', async ({ request, path, body }) => {
    // Extract the path without the /api prefix
    const targetPath = path.replace(/^\/api/, '');
    
    // Build the target URL
    const targetUrl = `${API_URL}${targetPath}`;
    
    console.log(`Proxying POST request to: ${targetUrl}`);
    
    try {
      // Forward the request to the backend API
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          ...Object.fromEntries(request.headers),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API proxy error:', error);
      return {
        success: false,
        error: 'ProxyError',
        message: 'Failed to connect to API server'
      };
    }
  })
  .put('/*', async ({ request, path, body }) => {
    // Similar implementation as POST
    const targetPath = path.replace(/^\/api/, '');
    const targetUrl = `${API_URL}${targetPath}`;
    
    try {
      const response = await fetch(targetUrl, {
        method: 'PUT',
        headers: {
          ...Object.fromEntries(request.headers),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API proxy error:', error);
      return {
        success: false,
        error: 'ProxyError',
        message: 'Failed to connect to API server'
      };
    }
  })
  .patch('/*', async ({ request, path, body }) => {
    // Similar implementation as POST
    const targetPath = path.replace(/^\/api/, '');
    const targetUrl = `${API_URL}${targetPath}`;
    
    try {
      const response = await fetch(targetUrl, {
        method: 'PATCH',
        headers: {
          ...Object.fromEntries(request.headers),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API proxy error:', error);
      return {
        success: false,
        error: 'ProxyError',
        message: 'Failed to connect to API server'
      };
    }
  })
  .delete('/*', async ({ request, path }) => {
    // Similar implementation as GET
    const targetPath = path.replace(/^\/api/, '');
    const targetUrl = `${API_URL}${targetPath}${request.url.includes('?') 
      ? request.url.substring(request.url.indexOf('?')) 
      : ''}`;
    
    try {
      const response = await fetch(targetUrl, {
        method: 'DELETE',
        headers: {
          ...Object.fromEntries(request.headers),
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API proxy error:', error);
      return {
        success: false,
        error: 'ProxyError',
        message: 'Failed to connect to API server'
      };
    }
  });

// Export the handlers for Next.js to use
export const GET = app.handle;
export const POST = app.handle;
export const PUT = app.handle;
export const PATCH = app.handle;
export const DELETE = app.handle; 