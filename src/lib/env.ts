/**
 * Environment variable validation
 * Validates required environment variables and provides typed access
 */

// Declare custom global property for TypeScript
declare global {
  interface Window {
    hasShownEnvWarning?: boolean;
    env?: Record<string, string>;
    reloadEnvVars?: () => void;
  }
}

// Define environment variable requirements
interface EnvVar {
  key: string;
  required: boolean;
  isPublic?: boolean;
}

// List all environment variables that should be validated
const envVars: EnvVar[] = [
  // API Configuration
  { key: 'NEXT_PUBLIC_API_URL', required: true, isPublic: true },
  { key: 'NEXT_PUBLIC_FRONTEND_URL', required: true, isPublic: true },
  { key: 'NEXT_PUBLIC_MINIO_URL', required: true, isPublic: true },
  
  // Feature Flags
  { key: 'NEXT_PUBLIC_ENABLE_AUTH', required: false, isPublic: true },
  { key: 'NEXT_PUBLIC_ENABLE_PURCHASE', required: false, isPublic: true },
  
  // Development
  { key: 'NODE_ENV', required: false },
  { key: 'NEXT_PUBLIC_FACTORY_ADDRESS', required: true, isPublic: true }, // Assuming this is a generic factory
  
  // Convex
  { key: 'NEXT_PUBLIC_CONVEX_URL', required: true, isPublic: true },
  
  // RPC URLs for Solana
  { key: 'RPC_URL_SOLANA_DEVNET', required: false },
  { key: 'RPC_URL_SOLANA_MAINNET', required: false },
  
  // Pinata - IPFS Storage - JWT is SERVER-SIDE ONLY
  { key: 'PINATA_JWT', required: true },
  { key: 'NEXT_PUBLIC_GATEWAY_URL', required: true, isPublic: true },
  
  // Moralis
  { key: 'MORALIS_API_KEY', required: false },

    // Solana Deployment Details (NEW)
    { key: 'NEXT_PUBLIC_SOLANA_NETWORK', required: true, isPublic: true },
    { key: 'NEXT_PUBLIC_SOLANA_PROGRAM_ID', required: true, isPublic: true },
    { key: 'NEXT_PUBLIC_SOLANA_ADMIN_WALLET', required: true, isPublic: true },
    { key: 'NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS', required: true, isPublic: true },
    { key: 'NEXT_PUBLIC_SOLANA_PROTOCOL_PDA', required: true, isPublic: true },
];

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Expose development helper for reloading env vars during development
if (isBrowser && process.env.NODE_ENV === 'development') {
  // Create a global method to manually reload environment variables
  window.reloadEnvVars = () => {
    console.log('🔄 Reloading environment variables...');
    fetch('/api/env')
      .then(res => res.json())
      .then(data => {
        window.env = data;
        console.log('✅ Environment variables reloaded:', Object.keys(data));
        // Force a page reload to apply the new variables
        window.location.reload();
      })
      .catch(err => {
        console.error('❌ Failed to reload environment variables:', err);
      });
  };
  
  // Add a message to help developers
  console.log('🔧 Development mode: You can call window.reloadEnvVars() to reload environment variables without restarting the server');
}

/**
 * Environment variables utility
 * Provides fallback values for important environment variables
 */

// Helper function to safely access environment variables
const getEnvValue = (key: string): string => {
  return typeof process !== 'undefined' && process.env && process.env[key] 
    ? process.env[key] || '' 
    : '';
};

// Format URL (remove trailing slashes)
const formatUrl = (url: string): string => {
  if (!url) return '';
  return url.replace(/\/$/, '');
};

const env = {
  // IPFS / Pinata configuration - PINATA_JWT is SERVER-SIDE ONLY
  pinataJwt: getEnvValue('PINATA_JWT') || '',
  gatewayUrl: getEnvValue('NEXT_PUBLIC_GATEWAY_URL') || 'gateway.pinata.cloud',
  
  // Solana configuration
  solanaNetwork: getEnvValue('NEXT_PUBLIC_SOLANA_NETWORK') || 'devnet',
  solanaProgramId: getEnvValue('NEXT_PUBLIC_SOLANA_PROGRAM_ID') || '5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV',
  solanaAdminWallet: getEnvValue('NEXT_PUBLIC_SOLANA_ADMIN_WALLET') || '63xvdhigaoS5rUxiqDzvRPBTLBbRXezX1dYm3nMvXri6',
  solanaTreasuryAddress: getEnvValue('NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS') || '9RgXRzRWMAvfjunEUK8QCJ5WGs8oVreTfXtVyAvABVBb',
  solanaProtocolPda: getEnvValue('NEXT_PUBLIC_SOLANA_PROTOCOL_PDA') || 'Protocol_PDA_5tGHM7n1',
  
  // Convex configuration
  convexUrl: formatUrl(getEnvValue('NEXT_PUBLIC_CONVEX_URL')) || '',
  
  // API configuration
  apiUrl: getEnvValue('NEXT_PUBLIC_API_URL') || 'http://localhost:3000',
  frontendUrl: getEnvValue('NEXT_PUBLIC_FRONTEND_URL') || 'http://localhost:3000',
  minioUrl: getEnvValue('NEXT_PUBLIC_MINIO_URL') || '',
  
  // Features
  enableAuth: getEnvValue('NEXT_PUBLIC_ENABLE_AUTH') === 'true',
  enablePurchase: getEnvValue('NEXT_PUBLIC_ENABLE_PURCHASE') === 'true',
  
  // Web3
  factoryAddress: getEnvValue('NEXT_PUBLIC_FACTORY_ADDRESS') || '5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV',
  
  // Solana RPC URLs
  rpcUrlSolanaDevnet: getEnvValue('RPC_URL_SOLANA_DEVNET') || 'https://api.devnet.solana.com',
  rpcUrlSolanaMainnetBeta: getEnvValue('RPC_URL_SOLANA_MAINNET') || 'https://api.mainnet-beta.solana.com',
  
  // Moralis
  moralisApiKey: getEnvValue('MORALIS_API_KEY') || '',
  
  // Development
  isDevelopment: getEnvValue('NODE_ENV') === 'development',
};

export default env;