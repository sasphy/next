import { Elysia, t } from 'elysia';
import type { Track, CreateTrackDTO } from '../../types';
import { ChainService, type Chain } from '../../services/chain/chain-service';

// Mock database for tracks
const tracks: Record<string, Track> = {
  '1': {
    id: '1',
    title: 'Summer Vibes',
    artist: 'DJ Sunshine',
    coverImage: 'https://placeholder.com/400',
    audioUrl: 'https://example.com/tracks/summer-vibes.mp3',
    previewUrl: 'https://example.com/previews/summer-vibes.mp3',
    price: 1.99,
    discoveryCount: 15,
    purchaseCount: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  '2': {
    id: '2',
    title: 'Night Drive',
    artist: 'Midnight Cruisers',
    coverImage: 'https://placeholder.com/400',
    audioUrl: 'https://example.com/tracks/night-drive.mp3',
    previewUrl: 'https://example.com/previews/night-drive.mp3',
    price: 2.49,
    discoveryCount: 8,
    purchaseCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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

// Tracks module 
export const tracksModule = new Elysia({ prefix: '/tracks' })
  // Define models for validation
  .model({
    track: t.Object({
      id: t.String(),
      title: t.String(),
      artist: t.String(),
      coverImage: t.String(),
      audioUrl: t.String(),
      previewUrl: t.String(),
      price: t.Number(),
      discoveryCount: t.Number(),
      purchaseCount: t.Number(),
      createdAt: t.String(),
      updatedAt: t.String()
    }),
    createTrack: t.Object({
      title: t.String({
        minLength: 1,
        error: 'Title is required'
      }),
      artist: t.String({
        minLength: 1,
        error: 'Artist is required'
      }),
      price: t.Number({
        minimum: 0,
        error: 'Price must be 0 or higher'
      })
    }),
    tracksResponse: t.Object({
      success: t.Boolean(),
      data: t.Optional(
        t.Union([
          t.Array(t.Ref('track')),
          t.Ref('track')
        ])
      ),
      error: t.Optional(t.String()),
      message: t.String(),
      pagination: t.Optional(t.Object({
        total: t.Number(),
        page: t.Number(),
        limit: t.Number()
      }))
    })
  })
  
  // Get all tracks with pagination
  .get('/', async ({ query, set }) => {
    try {
      const limit = Number(query?.limit || 10);
      const page = Number(query?.page || 1);
      const chain = (query?.chain || 'base') as Chain;
      
      // Check if chain is enabled
      if (!ChainService.isChainEnabled(chain)) {
        set.status = 400;
        return {
          success: false,
          error: 'BadRequest',
          message: `Chain ${chain} is not supported or enabled`
        };
      }
      
      // Proxy request to blockchain server
      const response = await ChainService.proxyRequest(
        chain,
        '/tracks',
        'GET',
        null,
        { 'Content-Type': 'application/json' }
      );
      
      // If blockchain server returns an error, return that error
      if (response.status >= 400) {
        set.status = response.status;
        return response.data;
      }
      
      // Return blockchain response
      return response.data;
    } catch (error) {
      console.error('Error proxying request:', error);
      set.status = 500;
      
      // Fallback to mock data
      const limit = Number(query?.limit || 10);
      const page = Number(query?.page || 1);
      const offset = (page - 1) * limit;
      
      const allTracks = Object.values(tracks);
      const paginatedTracks = allTracks.slice(offset, offset + limit);
      
      return {
        success: true,
        data: paginatedTracks,
        message: 'Tracks retrieved from mock data (proxy error)',
        pagination: {
          total: allTracks.length,
          page,
          limit
        }
      };
    }
  }, {
    query: t.Object({
      limit: t.Optional(t.String()),
      page: t.Optional(t.String()),
      chain: t.Optional(t.String())
    }),
    response: 'tracksResponse'
  })
  
  // Get track by ID
  .get('/:id', async ({ params, query, set }) => {
    try {
      const chain = (query?.chain || 'base') as Chain;
      
      // Check if chain is enabled
      if (!ChainService.isChainEnabled(chain)) {
        set.status = 400;
        return {
          success: false,
          error: 'BadRequest',
          message: `Chain ${chain} is not supported or enabled`
        };
      }
      
      // Proxy request to blockchain server
      const response = await ChainService.proxyRequest(
        chain,
        `/tracks/${params.id}`,
        'GET',
        null,
        { 'Content-Type': 'application/json' }
      );
      
      // If blockchain server returns an error, return that error
      if (response.status >= 400) {
        set.status = response.status;
        return response.data;
      }
      
      // Return blockchain response
      return response.data;
    } catch (error) {
      console.error('Error proxying request:', error);
      
      // Fallback to mock data
      const track = tracks[params.id];
      
      if (!track) {
        set.status = 404;
        return {
          success: false,
          error: 'NotFound',
          message: 'Track not found in mock data'
        };
      }
      
      return {
        success: true,
        data: track,
        message: 'Track retrieved from mock data (proxy error)'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      chain: t.Optional(t.String())
    }),
    response: 'tracksResponse'
  })
  
  // Get streaming URL for track (with auth)
  .use(authenticate)
  .get('/:id/stream', async ({ params, query, headers, set, userId, isAuthenticated }) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        set.status = 401;
        return {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required to stream tracks'
        };
      }
      
      const chain = (query?.chain || 'base') as Chain;
      
      // Check if chain is enabled
      if (!ChainService.isChainEnabled(chain)) {
        set.status = 400;
        return {
          success: false,
          error: 'BadRequest',
          message: `Chain ${chain} is not supported or enabled`
        };
      }
      
      // Proxy request to blockchain server
      const response = await ChainService.proxyRequest(
        chain,
        `/tracks/${params.id}/stream`,
        'GET',
        null,
        { 
          'Content-Type': 'application/json',
          'Authorization': headers.authorization || ''
        }
      );
      
      // If blockchain server returns an error, return that error
      if (response.status >= 400) {
        set.status = response.status;
        return response.data;
      }
      
      // Return blockchain response
      return response.data;
    } catch (error) {
      console.error('Error proxying stream request:', error);
      
      // Fallback to mock data
      const track = tracks[params.id];
      
      if (!track) {
        set.status = 404;
        return {
          success: false,
          error: 'NotFound',
          message: 'Track not found in mock data'
        };
      }
      
      return {
        success: true,
        data: {
          streamUrl: track.audioUrl,
          expiresIn: 3600 // seconds
        },
        message: 'Stream URL generated from mock data (proxy error)'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      chain: t.Optional(t.String())
    })
  })
  
  // Get preview URL for track (no auth required)
  .get('/:id/preview', async ({ params, query, set }) => {
    try {
      const chain = (query?.chain || 'base') as Chain;
      
      // Check if chain is enabled
      if (!ChainService.isChainEnabled(chain)) {
        set.status = 400;
        return {
          success: false,
          error: 'BadRequest',
          message: `Chain ${chain} is not supported or enabled`
        };
      }
      
      // Proxy request to blockchain server
      const response = await ChainService.proxyRequest(
        chain,
        `/tracks/${params.id}/preview`,
        'GET',
        null,
        { 'Content-Type': 'application/json' }
      );
      
      // If blockchain server returns an error, return that error
      if (response.status >= 400) {
        set.status = response.status;
        return response.data;
      }
      
      // Return blockchain response
      return response.data;
    } catch (error) {
      console.error('Error proxying preview request:', error);
      
      // Fallback to mock data
      const track = tracks[params.id];
      
      if (!track) {
        set.status = 404;
        return {
          success: false,
          error: 'NotFound',
          message: 'Track not found in mock data'
        };
      }
      
      return {
        success: true,
        data: {
          previewUrl: track.previewUrl,
          expiresIn: 3600 // seconds
        },
        message: 'Preview URL generated from mock data (proxy error)'
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    query: t.Object({
      chain: t.Optional(t.String())
    })
  })
  
  // Create a new track (with auth)
  .post('/', async ({ body, headers, userId, isAuthenticated, set, query }) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        set.status = 401;
        return {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required to create tracks'
        };
      }
      
      const chain = (query?.chain || 'base') as Chain;
      
      // Check if chain is enabled
      if (!ChainService.isChainEnabled(chain)) {
        set.status = 400;
        return {
          success: false,
          error: 'BadRequest',
          message: `Chain ${chain} is not supported or enabled`
        };
      }
      
      // Proxy request to blockchain server
      const response = await ChainService.proxyRequest(
        chain,
        '/tracks',
        'POST',
        body,
        { 
          'Content-Type': 'application/json',
          'Authorization': headers.authorization || ''
        }
      );
      
      // If blockchain server returns an error, return that error
      if (response.status >= 400) {
        set.status = response.status;
        return response.data;
      }
      
      // Return blockchain response
      return response.data;
    } catch (error) {
      console.error('Error proxying create track request:', error);
      
      // Fallback to mock data
      const { title, artist, price } = body;
      
      // Create a new track
      const newTrack: Track = {
        id: crypto.randomUUID(),
        title,
        artist,
        coverImage: `https://placeholder.com/400?text=${encodeURIComponent(title)}`,
        audioUrl: `https://example.com/tracks/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}.mp3`,
        previewUrl: `https://example.com/previews/${encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))}.mp3`,
        price,
        discoveryCount: 0,
        purchaseCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Store the track
      tracks[newTrack.id] = newTrack;
      
      return {
        success: true,
        data: newTrack,
        message: 'Track created from mock data (proxy error)'
      };
    }
  }, {
    body: 'createTrack',
    query: t.Object({
      chain: t.Optional(t.String())
    }),
    response: 'tracksResponse'
  })
  
  // File upload endpoint for tracks (with auth)
  .use(authenticate)
  .post('/upload', async ({ request, headers, query, userId, isAuthenticated, set }) => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        set.status = 401;
        return {
          success: false,
          error: 'Unauthorized',
          message: 'Authentication required to upload tracks'
        };
      }
      
      const chain = (query?.chain || 'base') as Chain;
      
      // Check if chain is enabled
      if (!ChainService.isChainEnabled(chain)) {
        set.status = 400;
        return {
          success: false,
          error: 'BadRequest',
          message: `Chain ${chain} is not supported or enabled`
        };
      }
      
      // Get form data from request
      const formData = await request.formData();
      
      // Pass the Authorization header
      const requestHeaders = {
        'Authorization': headers.authorization || ''
      };
      
      // Proxy the multipart form data request to the blockchain server
      const response = await ChainService.proxyMultipartRequest(
        chain,
        '/tracks/upload',
        formData,
        requestHeaders
      );
      
      // If blockchain server returns an error, return that error
      if (response.status >= 400) {
        set.status = response.status;
        return response.data;
      }
      
      // Return blockchain response
      return response.data;
    } catch (error) {
      console.error('Error proxying upload request:', error);
      set.status = 500;
      return {
        success: false,
        error: 'ServerError',
        message: 'Failed to upload track: ' + (error instanceof Error ? error.message : String(error))
      };
    }
  }, {
    query: t.Object({
      chain: t.Optional(t.String())
    })
  })
  
  // Search tracks
  .get('/search', ({ query }) => {
    const { q = '', limit = '10', page = '1' } = query;
    const searchTerm = q.toLowerCase();
    const limitNum = Number(limit);
    const pageNum = Number(page);
    const offset = (pageNum - 1) * limitNum;
    
    // Filter tracks by search term
    const filteredTracks = Object.values(tracks).filter(track => 
      track.title.toLowerCase().includes(searchTerm) ||
      track.artist.toLowerCase().includes(searchTerm)
    );
    
    // Paginate results
    const paginatedTracks = filteredTracks.slice(offset, offset + limitNum);
    
    return {
      success: true,
      data: paginatedTracks,
      message: `Found ${filteredTracks.length} tracks matching "${q}"`,
      pagination: {
        total: filteredTracks.length,
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
    response: 'tracksResponse'
  }); 