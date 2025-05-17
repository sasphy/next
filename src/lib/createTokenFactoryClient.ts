import { Connection, PublicKey } from '@solana/web3.js';
import TokenFactoryClient from './TokenFactoryClient';
import MockTokenFactoryClient from './MockTokenFactoryClient';

// Factory function that returns the appropriate client
export function createTokenFactoryClient(connection: Connection, wallet: any): TokenFactoryClient | MockTokenFactoryClient {
  // Check if we should use the mock implementation
  const useMock = process.env.NEXT_PUBLIC_USE_MOCK_TOKEN_FACTORY === 'true' || 
                  window?.ENV?.USE_MOCK_TOKEN_FACTORY === 'true';
  
  // Check if the program is deployed by trying to get its account info
  const checkProgram = async () => {
    try {
      const programId = new PublicKey('5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV');
      const accountInfo = await connection.getAccountInfo(programId);
      return accountInfo !== null;
    } catch (error) {
      console.warn('Error checking program deployment:', error);
      return false;
    }
  };
  
  // If explicitly set to use mock, or if the program isn't deployed, use mock
  if (useMock) {
    console.log('Using Mock Token Factory Client');
    return new MockTokenFactoryClient(connection, wallet);
  }
  
  // Otherwise use the real client
  console.log('Using Real Token Factory Client');
  return new TokenFactoryClient(connection, wallet);
}

export default createTokenFactoryClient;