import { 
  APIResponse, 
  LoginResponse, 
  NonceResponse,
  PurchaseResponse,
  StreamUrlResponse,
  TokenOwnership,
  Track 
} from '../types';

/**
 * API client for interacting with the SolBeat API
 */
export class SolanaAPI {
  private readonly baseUrl: string;
  private _token: string | null = null;

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

  constructor(baseUrl: string = '/api/blockchain') {
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this._token = token;
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('solbeat_token', token);
    }
  }

  /**
   * Clear authentication token
   */
  clearToken(): void {
    this._token = null;
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('solbeat_token');
    }
  }

  /**
   * Initialize token from localStorage if available
   */
  initToken(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('solbeat_token');
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
        'Authorization': `Bearer ${this._token}`
      };
    }
    
    try {
      const response = await fetch(url, options);
      
      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return data as APIResponse<T>;
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      
      // Return a failed response
      return {
        success: false,
        error: 'NetworkError',
        message: error instanceof Error ? error.message : 'Network request failed'
      } as APIResponse<T>;
    }
  }

  /**
   * Get all tracks
   */
  async getTracks(): Promise<APIResponse<Track[]>> {
    return this.request<Track[]>('/tracks');
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
}

// Create and export a singleton instance
export const solanaApi = new SolanaAPI();

// Initialize token from localStorage if available
if (typeof window !== 'undefined') {
  solanaApi.initToken();
}
