/**
 * ChainService
 * 
 * Handles proxying requests to the appropriate blockchain-specific server
 * based on the chain parameter.
 */

// Chain type
export type Chain = 'base' | 'solana' | 'bitcoin' | 'sui';

// Chain configuration
interface ChainConfig {
  name: string;
  url: string;
  port: number;
  enabled: boolean;
  description: string;
}

// Chain service configuration
const chainConfig: Record<Chain, ChainConfig> = {
  base: {
    name: 'Base',
    url: 'http://localhost',
    port: 3001,
    enabled: true,
    description: 'EVM-compatible blockchain using ERC-1155'
  },
  solana: {
    name: 'Solana',
    url: 'http://localhost',
    port: 3099,
    enabled: true,
    description: 'High-performance blockchain using Metaplex'
  },
  bitcoin: {
    name: 'Bitcoin',
    url: 'http://localhost',
    port: 3003,
    enabled: true,
    description: 'Bitcoin blockchain using SRC-20 Stamps'
  },
  sui: {
    name: 'Sui',
    url: 'http://localhost',
    port: 3004,
    enabled: true,
    description: 'Sui blockchain using Move objects'
  }
};

/**
 * Chain Service class
 * Handles proxying requests to the appropriate blockchain-specific server
 */
export class ChainService {
  /**
   * Get information about all available chains
   */
  static getChains() {
    return Object.entries(chainConfig).map(([id, config]) => ({
      id,
      name: config.name,
      enabled: config.enabled,
      description: config.description
    }));
  }
  
  /**
   * Check if a chain is enabled
   */
  static isChainEnabled(chain: Chain): boolean {
    return chainConfig[chain]?.enabled || false;
  }
  
  /**
   * Get the base URL for a chain
   */
  static getChainUrl(chain: Chain): string {
    const config = chainConfig[chain];
    if (!config) {
      throw new Error(`Unknown chain: ${chain}`);
    }
    return `${config.url}:${config.port}`;
  }
  
  /**
   * Proxy a request to the appropriate blockchain server
   */
  static async proxyRequest(
    chain: Chain, 
    path: string, 
    method: string = 'GET', 
    body?: any,
    headers?: Record<string, string>
  ) {
    if (!this.isChainEnabled(chain)) {
      throw new Error(`Chain ${chain} is not enabled`);
    }
    
    const baseUrl = this.getChainUrl(chain);
    const url = `${baseUrl}${path}`;
    
    console.log(`Proxying ${method} request to ${url}`);
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, requestOptions);
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries())
        };
      } else {
        const data = await response.text();
        return {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries())
        };
      }
    } catch (error) {
      console.error(`Error proxying request to ${url}:`, error);
      throw new Error(`Error proxying request: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Proxy a multipart form data request to the appropriate blockchain server
   */
  static async proxyMultipartRequest(
    chain: Chain, 
    path: string, 
    formData: FormData,
    headers?: Record<string, string>
  ) {
    if (!this.isChainEnabled(chain)) {
      throw new Error(`Chain ${chain} is not enabled`);
    }
    
    const baseUrl = this.getChainUrl(chain);
    const url = `${baseUrl}${path}`;
    
    console.log(`Proxying multipart POST request to ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...headers
        }
      });
      
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries())
        };
      } else {
        const data = await response.text();
        return {
          status: response.status,
          data,
          headers: Object.fromEntries(response.headers.entries())
        };
      }
    } catch (error) {
      console.error(`Error proxying multipart request to ${url}:`, error);
      throw new Error(`Error proxying multipart request: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
