/**
 * Script to reload environment variables from window.ENV
 * This is useful when environment variables aren't loading properly from .env files
 */

export function reloadClientEnv() {
  // Only run on client side
  if (typeof window === 'undefined') return;
  
  if (!window.ENV) {
    console.warn('window.ENV is not defined. Environment variables may not be properly loaded.');
    // Initialize with required fields
    window.ENV = {
      API_URL: process.env.NEXT_PUBLIC_API_URL || '',
      STORAGE_URL: process.env.NEXT_PUBLIC_MINIO_URL || '',
      FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || '',
      FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '',
      CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || '',
      GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL || '',
      SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
      SOLANA_PROGRAM_ID: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '',
      SOLANA_ADMIN_WALLET: process.env.NEXT_PUBLIC_SOLANA_ADMIN_WALLET || '',
      SOLANA_TREASURY_ADDRESS: process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS || '',
      SOLANA_PROTOCOL_PDA: process.env.NEXT_PUBLIC_SOLANA_PROTOCOL_PDA || '',
      IS_DEV: process.env.NODE_ENV !== 'production'
    };
    return;
  }
  
  // Map of window.ENV keys to NEXT_PUBLIC keys
  const variableMap = {
    'API_URL': 'NEXT_PUBLIC_API_URL',
    'FRONTEND_URL': 'NEXT_PUBLIC_FRONTEND_URL',
    'STORAGE_URL': 'NEXT_PUBLIC_MINIO_URL', // Note the name difference
    'MINIO_URL': 'NEXT_PUBLIC_MINIO_URL',
    'FACTORY_ADDRESS': 'NEXT_PUBLIC_FACTORY_ADDRESS',
    'CONVEX_URL': 'NEXT_PUBLIC_CONVEX_URL',
    'GATEWAY_URL': 'NEXT_PUBLIC_GATEWAY_URL',
    'SOLANA_NETWORK': 'NEXT_PUBLIC_SOLANA_NETWORK',
    'SOLANA_PROGRAM_ID': 'NEXT_PUBLIC_SOLANA_PROGRAM_ID',
    'SOLANA_ADMIN_WALLET': 'NEXT_PUBLIC_SOLANA_ADMIN_WALLET',
    'SOLANA_TREASURY_ADDRESS': 'NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS',
    'SOLANA_PROTOCOL_PDA': 'NEXT_PUBLIC_SOLANA_PROTOCOL_PDA'
  };
  
  // Force update process.env with window.ENV values
  Object.entries(variableMap).forEach(([windowKey, envKey]) => {
    if (window.ENV && window.ENV[windowKey]) {
      try {
        // @ts-ignore - Need to override the readonly nature of process.env
        process.env[envKey] = window.ENV[windowKey];
      } catch (error) {
        console.warn(`Could not set ${envKey}:`, error);
      }
    }
  });
  
  console.log('Environment variables reloaded from window.ENV');
}

// Helper to get environment variable with fallbacks
export function getEnvVar(key: string, defaultValue: string = '') {
  // Check window.ENV first if in browser
  if (typeof window !== 'undefined' && window.ENV) {
    // Check direct mapping first
    if (window.ENV[key]) {
      return window.ENV[key];
    }
    
    // Try with different casing patterns
    const keyVariations = [
      key,
      key.toUpperCase(),
      key.toLowerCase(),
      // Convert NEXT_PUBLIC_API_URL → API_URL
      key.replace(/^NEXT_PUBLIC_/, ''),
      key.replace(/^NEXT_PUBLIC_/, '').toUpperCase(),
      // Convert api_url → API_URL
      key.toUpperCase()
    ];
    
    for (const variation of keyVariations) {
      if (window.ENV[variation]) {
        return window.ENV[variation];
      }
    }
  }
  
  // Then check process.env
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) {
      return process.env[key] || '';
    }
    
    // If key doesn't start with NEXT_PUBLIC_, check that version too
    if (!key.startsWith('NEXT_PUBLIC_')) {
      const publicKey = `NEXT_PUBLIC_${key}`;
      if (process.env[publicKey]) {
        return process.env[publicKey] || '';
      }
    }
  }
  
  return defaultValue;
}

export default {
  reloadClientEnv,
  getEnvVar
};
