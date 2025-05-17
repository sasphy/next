import { 
  APIResponse, 
  LoginResponse, 
  NonceResponse,
  PurchaseResponse,
  StreamUrlResponse,
  TokenOwnership,
  Track,
  User,
  Artist,
  Playlist,
  SearchResults
} from '../types';

/**
 * API client for interacting with the Sasphy API
 */
export class SolanaAPI {
  // Make baseUrl publicly accessible so it can be updated
  public baseUrl: string;
  private _token: string | null = null;
  private _simulationMode: boolean = false; // Track if server is in simulation mode

  /**
   * Check if server is in simulation mode
   */
  get isSimulationMode(): boolean {
    return this._simulationMode;
  }

  /**
   * Check if user is authenticated
   */
  get hasToken(): boolean {
    return !!this._token;
  }
  
  /**
   * Get the current token
   */
  get token(): string | null {
    return this._token;
  }

  constructor(baseUrl?: string) {
    // Try to get baseUrl from various sources with fallbacks
    if (baseUrl) {
      this.baseUrl = baseUrl;
    } else if (typeof window !== 'undefined' && window.ENV && window.ENV.BLOCKCHAIN_API_URL) {
      this.baseUrl = window.ENV.BLOCKCHAIN_API_URL;
    } else if (process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL) {
      this.baseUrl = process.env.NEXT_PUBLIC_BLOCKCHAIN_API_URL;
    } else if (typeof window !== 'undefined' && window.ENV && window.ENV.API_URL) {
      this.baseUrl = window.ENV.API_URL;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      this.baseUrl = process.env.NEXT_PUBLIC_API_URL;
    } else {
      this.baseUrl = 'http://localhost:3099';
    }
    
    // Log the API URL for debugging
    if (typeof window !== 'undefined') {
      console.log(`SolanaAPI initialized with baseUrl: ${this.baseUrl}`);
    }
    
    // Check server status to determine if we're in simulation mode
    this.checkServerStatus();
  }
  
  /**
   * Check server status to determine if we're in simulation mode
   */
  async checkServerStatus(): Promise<void> {
    try {
      // Use the base URL without the /blockchain path for status checks
      const statusUrl = this.baseUrl.replace(/\/blockchain$/, '');
      console.log(`Checking server status at: ${statusUrl}/status`);
      
      const response = await fetch(`${statusUrl}/status`);
      if (response.ok) {
        const data = await response.json();
        this._simulationMode = data.mode === 'simulation';
        console.log(`Server running in ${this._simulationMode ? 'simulation' : 'production'} mode`);
      }
    } catch (error) {
      console.error('Failed to check server status:', error);
      // Default to simulation mode if status check fails
      this._simulationMode = true;
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this._token = token;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('sasphy_token', token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this._token = null;
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sasphy_token');
    }
  }

  /**
   * Initialize token from localStorage if available
   */
  initToken(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sasphy_token');
      if (token) {
        this._token = token;
      }
    }
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this._token) {
      headers['Authorization'] = `Bearer ${this._token}`;
    }

    return headers;
  }

  /**
   * Make a request to the API
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add token to headers if available
    if (this._token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this._token}`,
        'Content-Type': 'application/json'
      };
    } else if (!options.headers || !('Content-Type' in options.headers)) {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      };
    }
    
    try {
      console.log(`Requesting: ${url}`);
      const response = await fetch(url, options);
      
      // If the response is not ok, throw an error
      if (!response.ok) {
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        
        try {
          // Try to parse error message from JSON response
          const errorData = await response.json();
          if (errorData.error || errorData.message) {
            errorMessage = errorData.error || errorData.message;
          }
        } catch {
          // Ignore parse errors for non-JSON responses
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      // Check if we're in simulation mode
      if (data.simulated !== undefined) {
        this._simulationMode = data.simulated;
      }
      
      // Return success response
      return {
        success: true,
        data: data
      } as APIResponse<T>;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      
      // Return a failed response
      return {
        success: false,
        error: error instanceof Error ? error.name : 'NetworkError',
        message: error instanceof Error ? error.message : 'Network request failed'
      } as APIResponse<T>;
    }
  }

  /**
   * Get all tracks with optional filter
   */
  async getTracks(filter?: string): Promise<APIResponse<Track[]>> {
    const endpoint = filter ? `/tracks?filter=${encodeURIComponent(filter)}` : '/tracks';
    return this.request<Track[]>(endpoint);
  }

  /**
   * Get a track by ID
   */
  async getTrack(trackId: string): Promise<APIResponse<Track>> {
    return this.request<Track>(`/tracks/${trackId}`);
  }

  /**
   * Get a track by token ID from blockchain
   */
  async getTrackByToken(tokenId: number): Promise<APIResponse<Track>> {
    return this.request<Track>(`/tracks/token/${tokenId}`);
  }

  /**
   * Get streaming URL for a track
   */
  async getStreamUrl(trackId: string): Promise<APIResponse<StreamUrlResponse>> {
    return this.request<StreamUrlResponse>(`/tracks/stream/${trackId}`);
  }

  /**
   * Get preview URL for a track
   */
  async getPreviewUrl(trackId: string): Promise<APIResponse<StreamUrlResponse>> {
    return this.request<StreamUrlResponse>(`/tracks/preview/${trackId}`);
  }

  /**
   * Request a nonce for authentication
   */
  async getNonce(address: string): Promise<APIResponse<NonceResponse>> {
    return this.request<NonceResponse>('/auth/nonce', {
      method: 'POST',
      body: JSON.stringify({ address }),
      headers: this.getHeaders()
    });
  }

  /**
   * Login with signature
   */
  async login(address: string, signature: string): Promise<APIResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ address, signature }),
      headers: this.getHeaders()
    });
    
    if (response.success && response.data) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  /**
   * Update user profile
   */
  async updateProfile(username?: string, profileImage?: string): Promise<APIResponse<Record<string, unknown>>> {
    return this.request<Record<string, unknown>>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ username, profileImage }),
      headers: this.getHeaders()
    });
  }

  /**
   * Purchase a track
   */
  async purchaseTrack(tokenId: number, price?: string): Promise<APIResponse<PurchaseResponse>> {
    return this.request<PurchaseResponse>(
      `/payments/purchase/${tokenId}`, 
      {
        method: 'POST',
        body: JSON.stringify(price ? { price } : {}),
        headers: this.getHeaders()
      }
    );
  }

  /**
   * Check ownership of a track
   */
  async checkOwnership(tokenId: number): Promise<APIResponse<TokenOwnership>> {
    return this.request<TokenOwnership>(`/payments/ownership/${tokenId}`);
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<APIResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  /**
   * Get user's library (tracks they have saved)
   */
  async getLibrary(): Promise<APIResponse<Track[]>> {
    return this.request<Track[]>('/user/library');
  }

  /**
   * Add a track to user's library
   */
  async addToLibrary(trackId: string): Promise<APIResponse<{success: boolean}>> {
    return this.request<{success: boolean}>(`/user/library/${trackId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  /**
   * Remove a track from user's library
   */
  async removeFromLibrary(trackId: string): Promise<APIResponse<{success: boolean}>> {
    return this.request<{success: boolean}>(`/user/library/${trackId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  /**
   * Get popular tracks
   */
  async getPopularTracks(limit: number = 10): Promise<APIResponse<Track[]>> {
    return this.request<Track[]>(`/tracks/popular?limit=${limit}`);
  }

  /**
   * Get new releases
   */
  async getNewReleases(limit: number = 10): Promise<APIResponse<Track[]>> {
    return this.request<Track[]>(`/tracks/new?limit=${limit}`);
  }

  /**
   * Get tracks by genre
   */
  async getTracksByGenre(genre: string, limit: number = 10): Promise<APIResponse<Track[]>> {
    return this.request<Track[]>(`/tracks/genre/${encodeURIComponent(genre)}?limit=${limit}`);
  }

  /**
   * Get all playlists for the user
   */
  async getPlaylists(): Promise<APIResponse<Playlist[]>> {
    return this.request<Playlist[]>('/playlists');
  }

  /**
   * Get a specific playlist
   */
  async getPlaylist(playlistId: string): Promise<APIResponse<Playlist>> {
    return this.request<Playlist>(`/playlists/${playlistId}`);
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(name: string, description?: string, isPublic: boolean = true): Promise<APIResponse<Playlist>> {
    return this.request<Playlist>('/playlists', {
      method: 'POST',
      body: JSON.stringify({ name, description, isPublic }),
      headers: this.getHeaders()
    });
  }

  /**
   * Update a playlist
   */
  async updatePlaylist(playlistId: string, updates: Partial<Playlist>): Promise<APIResponse<Playlist>> {
    return this.request<Playlist>(`/playlists/${playlistId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
      headers: this.getHeaders()
    });
  }

  /**
   * Delete a playlist
   */
  async deletePlaylist(playlistId: string): Promise<APIResponse<{success: boolean}>> {
    return this.request<{success: boolean}>(`/playlists/${playlistId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  /**
   * Add a track to a playlist
   */
  async addTrackToPlaylist(playlistId: string, trackId: string): Promise<APIResponse<{success: boolean}>> {
    return this.request<{success: boolean}>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'POST',
      headers: this.getHeaders()
    });
  }

  /**
   * Remove a track from a playlist
   */
  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<APIResponse<{success: boolean}>> {
    return this.request<{success: boolean}>(`/playlists/${playlistId}/tracks/${trackId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
  }

  /**
   * Search for tracks, artists, or playlists
   */
  async search(query: string, type: 'all' | 'tracks' | 'artists' | 'playlists' = 'all'): Promise<APIResponse<SearchResults>> {
    return this.request<SearchResults>(`/search?q=${encodeURIComponent(query)}&type=${type}`);
  }

  /**
   * Get artist profile
   */
  async getArtist(artistId: string): Promise<APIResponse<Artist>> {
    return this.request<Artist>(`/artists/${artistId}`);
  }

  /**
   * Get tracks by an artist
   */
  async getArtistTracks(artistId: string): Promise<APIResponse<Track[]>> {
    return this.request<Track[]>(`/artists/${artistId}/tracks`);
  }
}

// Create and export a singleton instance
export const solanaApi = new SolanaAPI();

// Initialize token from localStorage if available
if (typeof window !== 'undefined') {
  solanaApi.initToken();
}
