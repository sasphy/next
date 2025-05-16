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
  
  // Pinata - IPFS Storage
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
 * Helper function to safely access environment variables
 */
const getEnvValue = (key: string): string => {
  // For client-side with window.env override (helpful for development)
  if (isBrowser && window.env && window.env[key]) {
    return window.env[key];
  }
  
  // Direct access to process.env variables with handling of undefined values
  const value = process.env[key];
  
  // For server-side
  if (!isBrowser) {
    return value !== undefined ? value : '';
  }
  
  // For client-side NEXT_PUBLIC_ variables
  if (key.startsWith('NEXT_PUBLIC_')) {
    return value !== undefined ? value : '';
  }
  
  // Client-side access to server-side variables (via Next.js's env config)
  return value !== undefined ? value : '';
};

/**
 * Ensure a URL is in a valid format with protocol
 */
const formatUrl = (url: string): string => {
  if (!url || url.trim() === '') return '';
  
  // Remove @ prefix if present
  let formattedUrl = url.startsWith('@') ? url.substring(1) : url;
  
  // Add https:// protocol if missing
  if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
    formattedUrl = `https://${formattedUrl}`;
  }
  
  return formattedUrl;
};

// Validate environment variables
const validateEnv = (): void => {
  // Server-side validation
  if (!isBrowser) {
    const missingVars: string[] = [];
    
    envVars.forEach(({ key, required }) => {
      const value = process.env[key];
      if (required && (!value || value.trim() === '')) {
        missingVars.push(key);
      }
    });
    
    if (missingVars.length > 0) {
      console.error(
        `\n❌ Missing required environment variables in .env file:\n` +
        missingVars.map(key => `   - ${key}`).join('\n') +
        `\n\nPlease check your .env or .env.local file.\n`
      );
      
      // In development mode, we'll show a UI warning instead of throwing an error
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Missing required environment variables. See console for details.');
      }
    } else {
      console.log('✅ Environment variables validated successfully');
      
      console.log('🔑 IPFS Gateway URL:', process.env.NEXT_PUBLIC_GATEWAY_URL || '[Not Set]');
      console.log('🔑 Pinata JWT:', process.env.PINATA_JWT ? '[Set]' : '[Not Set]');
      console.log('🔑 Convex URL:', process.env.NEXT_PUBLIC_CONVEX_URL || '[Not Set]');
      console.log('🔑 Solana Devnet RPC URL:', process.env.RPC_URL_SOLANA_DEVNET || '[Not Set]');
      console.log('🔑 Solana Mainnet-Beta RPC URL:', process.env.RPC_URL_SOLANA_MAINNET || '[Not Set]');
      console.log('🔑 Solana Network:', process.env.NEXT_PUBLIC_SOLANA_NETWORK || '[Not Set]');
      console.log('🔑 Solana Program ID:', process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '[Not Set]');
    }
  } 
  
  // Client-side validation (only checks public variables)
  if (isBrowser) {
    const missingClientVars: string[] = [];
    
    envVars
      .filter(v => v.isPublic && v.required)
      .forEach(({ key }) => {
        const value = getEnvValue(key); 
        
        if (!value || value.trim() === '') {
          missingClientVars.push(key);
        }
      });
    
    if (missingClientVars.length > 0) {
      if (!window.hasShownEnvWarning) {
        console.warn(
          `⚠️ Missing client-side environment variables:\n` +
          missingClientVars.map(key => `   - ${key}`).join('\n')
        );
        window.hasShownEnvWarning = true;
      }
    }
  }
};

// Expose a typed way to access environment variables
export const env = {
  // API Configuration
  apiUrl: getEnvValue('NEXT_PUBLIC_API_URL'),
  frontendUrl: getEnvValue('NEXT_PUBLIC_FRONTEND_URL'),
  minioUrl: getEnvValue('NEXT_PUBLIC_MINIO_URL'),
  
  // Features
  enableAuth: getEnvValue('NEXT_PUBLIC_ENABLE_AUTH') === 'true',
  enablePurchase: getEnvValue('NEXT_PUBLIC_ENABLE_PURCHASE') === 'true',
  
  // IPFS/Pinata
  pinataJwt: getEnvValue('PINATA_JWT'),
  gatewayUrl: getEnvValue('NEXT_PUBLIC_GATEWAY_URL') || 'https://gateway.pinata.cloud/ipfs',
  
  // Web3
  factoryAddress: getEnvValue('NEXT_PUBLIC_FACTORY_ADDRESS'), 
  
  // Convex
  convexUrl: formatUrl(getEnvValue('NEXT_PUBLIC_CONVEX_URL')),
  
  // Solana RPC URLs
  rpcUrlSolanaDevnet: getEnvValue('RPC_URL_SOLANA_DEVNET'),
  rpcUrlSolanaMainnetBeta: getEnvValue('RPC_URL_SOLANA_MAINNET'),
  
  // Moralis
  moralisApiKey: getEnvValue('MORALIS_API_KEY'),
  
  // Development
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',

  // Solana Deployment Details
  solanaNetwork: getEnvValue('NEXT_PUBLIC_SOLANA_NETWORK'),
  solanaProgramId: getEnvValue('NEXT_PUBLIC_SOLANA_PROGRAM_ID'),
  solanaAdminWallet: getEnvValue('NEXT_PUBLIC_SOLANA_ADMIN_WALLET'),
  solanaTreasuryAddress: getEnvValue('NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS'),
  solanaProtocolPda: getEnvValue('NEXT_PUBLIC_SOLANA_PROTOCOL_PDA'),
};

// Run validation
validateEnv();

export default env;