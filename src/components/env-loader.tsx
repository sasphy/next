'use client';

import { useEffect } from 'react';

/**
 * A component that ensures environment variables are loaded correctly
 * This component can be placed at the top level of your application
 */
export default function EnvLoader() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Check if window.ENV exists
    if (!window.ENV) {
      // Log diagnostic message
      console.warn('window.ENV not found, initializing with default values');
      
      // Initialize window.ENV with defaults
      window.ENV = {
        // Default values
        API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3099',
        STORAGE_URL: process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000',
        FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3088',
        FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV',
        CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || 'https://quiet-ram-327.convex.cloud',
        GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL || 'indigo-leading-rabbit-443.mypinata.cloud',
        SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'Solana Devnet',
        SOLANA_PROGRAM_ID: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV',
        SOLANA_ADMIN_WALLET: process.env.NEXT_PUBLIC_SOLANA_ADMIN_WALLET || '63xvdhigaoS5rUxiqDzvRPBTLBbRXezX1dYm3nMvXri6',
        SOLANA_TREASURY_ADDRESS: process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS || '9RgXRzRWMAvfjunEUK8QCJ5WGs8oVreTfXtVyAvABVBb',
        SOLANA_PROTOCOL_PDA: process.env.NEXT_PUBLIC_SOLANA_PROTOCOL_PDA || 'Protocol_PDA_5tGHM7n1',
        IS_DEV: process.env.NODE_ENV === 'development'
      };
    } 
    
    // Load environment variables from API
    const loadEnvVars = async () => {
      try {
        const res = await fetch('/api/env');
        if (res.ok) {
          const data = await res.json();
          
          // Update window.ENV with fetched values
          window.ENV = { ...window.ENV, ...data };
          console.log('✅ Environment variables loaded from API');
        }
      } catch (error) {
        console.warn('Failed to load environment variables from API:', error);
      }
    };
    
    // Load environment variables without blocking
    loadEnvVars();
  }, []);
  
  // This component doesn't render anything
  return null;
}
