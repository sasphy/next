'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useSolBeat } from '@/components/providers/solbeat-provider';
import { useCallback, useState } from 'react';
import { 
  SignatureResult, 
  VersionedTransaction, 
  VersionedMessage, 
  TransactionMessage,
  Connection, 
  PublicKey 
} from '@solana/web3.js';
import bs58 from 'bs58';

export function useWalletAuth() {
  const { publicKey, signMessage, signTransaction, connected } = useWallet();
  const { login, logout, isAuthenticated, address } = useSolBeat();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or does not support message signing');
    }

    setIsLoggingIn(true);
    try {
      // 1. Get nonce from backend
      const nonceResponse = await fetch('/api/blockchain/auth/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: publicKey.toString() })
      });
      
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce from server');
      }
      
      const { data: nonceData } = await nonceResponse.json();
      
      if (!nonceData || !nonceData.nonce) {
        throw new Error('Invalid nonce response');
      }
      
      // 2. Sign the nonce
      const message = `Sign this message to verify your wallet ownership: ${nonceData.nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);
      
      // 3. Send signature to backend to complete login
      const loginSuccess = await login(publicKey.toString(), bs58.encode(signature));
      return loginSuccess;
    } catch (error) {
      console.error('Sign-in error:', error);
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [publicKey, signMessage, login]);

  const handleSignOut = useCallback(() => {
    logout();
  }, [logout]);

  return {
    isWalletConnected: connected,
    isAuthenticated,
    isLoggingIn,
    walletAddress: publicKey?.toString() || null,
    signIn: handleSignIn,
    signOut: handleSignOut,
    authenticatedAddress: address
  };
}
