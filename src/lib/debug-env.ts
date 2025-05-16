/**
 * Debug utility for checking environment variables
 */

export function debugEnvironmentVariables() {
  console.group('Environment Variables Debug Info');
  
  // Check if we're on client or server
  console.log('Runtime:', typeof window === 'undefined' ? 'Server' : 'Client');
  
  // Check process.env variables
  console.group('process.env NEXT_PUBLIC_ variables:');
  const envVars = [
    'NEXT_PUBLIC_API_URL',
    'NEXT_PUBLIC_FRONTEND_URL',
    'NEXT_PUBLIC_MINIO_URL',
    'NEXT_PUBLIC_FACTORY_ADDRESS',
    'NEXT_PUBLIC_CONVEX_URL',
    'NEXT_PUBLIC_GATEWAY_URL',
    'NEXT_PUBLIC_SOLANA_NETWORK',
    'NEXT_PUBLIC_SOLANA_PROGRAM_ID',
    'NEXT_PUBLIC_SOLANA_ADMIN_WALLET',
    'NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS',
    'NEXT_PUBLIC_SOLANA_PROTOCOL_PDA'
  ];
  
  envVars.forEach(key => {
    console.log(`${key}: ${process.env[key] ? '[SET]' : '[UNDEFINED]'}`);
  });
  console.groupEnd();
  
  // Check window.ENV if on client
  if (typeof window !== 'undefined' && window.ENV) {
    console.group('window.ENV variables:');
    Object.keys(window.ENV).forEach(key => {
      console.log(`${key}: ${window.ENV[key] ? '[SET]' : '[UNDEFINED]'}`);
    });
    console.groupEnd();
  } else if (typeof window !== 'undefined') {
    console.log('window.ENV is not defined!');
  }
  
  console.groupEnd();
  
  // Return diagnostic info
  return {
    runtime: typeof window === 'undefined' ? 'Server' : 'Client',
    processEnvAvailable: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_')).length > 0,
    windowEnvAvailable: typeof window !== 'undefined' && !!window.ENV,
    windowEnvVarCount: typeof window !== 'undefined' && window.ENV ? Object.keys(window.ENV).length : 0
  };
}

export default debugEnvironmentVariables;
