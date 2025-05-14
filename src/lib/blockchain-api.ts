import { solanaApi } from './services/solana-api';

// Define API clients for different blockchains
const sasphyApi = solanaApi; // Solana blockchain API

/**
 * Initialize all API clients
 */
export function initializeApiClients() {
  // Initialize tokens from localStorage if available
  if (typeof window !== 'undefined') {
    sasphyApi.initToken();
  }
}

// Initialize API clients
initializeApiClients();

// Export API clients
export { sasphyApi };

// Default export for backward compatibility
export default sasphyApi;
