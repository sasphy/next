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
        FACTORY_ADDRESS: process.env.NEXT_PUBLIC_FACTORY_ADDRESS || 'A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK',
        CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || 'https://quiet-ram-327.convex.cloud',
        GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL || 'indigo-leading-rabbit-443.mypinata.cloud',
        SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet',
        SOLANA_PROGRAM_ID: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || 'A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK',
        SOLANA_ADMIN_WALLET: process.env.NEXT_PUBLIC_SOLANA_ADMIN_WALLET || '7vCWanYCd848kSEqEbZUuamhgFhnKqDh4b2TC1fVEGg9',
        SOLANA_TREASURY_ADDRESS: process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS || 'FXHUWiWF2QcjnZ9qCkxrzKpjuwzgr3e8acCPV4sKPRSV',
        SOLANA_PROTOCOL_PDA: process.env.NEXT_PUBLIC_SOLANA_PROTOCOL_PDA || '4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM',
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
