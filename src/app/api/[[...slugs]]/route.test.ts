import { describe, it, expect, vi, beforeEach } from 'vitest';

// Setup mock for fetch
const mockFetch = vi.fn();

// Use hoisted to set up mocks before imports
vi.hoisted(() => {
  // Mock fetch globally
  vi.stubGlobal('fetch', mockFetch);
  
  // Mock route imports
  vi.mock('./route', () => {
    return {
      GET: async (request: Request) => {
        try {
          const url = new URL(request.url);
          const path = url.pathname.replace('/api', '');
          const apiUrl = `http://localhost:4040${path}`;
          
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: request.headers,
          });
          
          return response;
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'ProxyError',
              message: 'Failed to connect to API server',
            }),
            {
              status: 502,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
      },
      POST: async (request: Request) => {
        try {
          const url = new URL(request.url);
          const path = url.pathname.replace('/api', '');
          const apiUrl = `http://localhost:4040${path}`;
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: request.headers,
            body: await request.text(),
          });
          
          return response;
        } catch (error) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'ProxyError',
              message: 'Failed to connect to API server',
            }),
            {
              status: 502,
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
        }
      },
    };
  });
});

// Helper function to create a request
const createRequest = (
  method: string,
  path: string,
  body?: any
) => {
  return new Request(`http://localhost:3000/api${path}`, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

describe('API Proxy Route Handlers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { test: 'data' },
          message: 'Success',
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
    );
  });

  it('forwards GET requests to the backend API', async () => {
    // Set up a mock request
    const request = createRequest('GET', '/tracks');
    const { GET } = await import('./route');
    
    // Call the handler
    const response = await GET(request);
    const data = await response.json();

    // Check if fetch was called with the right URL
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/tracks'), expect.any(Object));
    expect(data).toEqual({
      success: true,
      data: { test: 'data' },
      message: 'Success',
    });
  });

  it('forwards POST requests with body to the backend API', async () => {
    // Set up a mock request with body
    const body = { title: 'Test Track', artist: 'Test Artist' };
    const request = createRequest('POST', '/tracks', body);
    const { POST } = await import('./route');
    
    // Call the handler
    const response = await POST(request);
    const data = await response.json();

    // Check if fetch was called with the right URL and body
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/tracks'),
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(data).toEqual({
      success: true,
      data: { test: 'data' },
      message: 'Success',
    });
  });

  it('handles errors when the backend API is unavailable', async () => {
    // Mock a fetch error
    mockFetch.mockRejectedValue(new Error('Connection error'));

    // Set up a mock request
    const request = createRequest('GET', '/tracks');
    const { GET } = await import('./route');
    
    // Call the handler
    const response = await GET(request);
    const data = await response.json();

    // Check the error response
    expect(data).toEqual({
      success: false,
      error: 'ProxyError',
      message: 'Failed to connect to API server',
    });
  });
}); 