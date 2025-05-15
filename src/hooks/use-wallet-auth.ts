'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useSasphy } from '@/components/providers/sasphy-provider';
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
import { toast } from 'sonner';

export function useWalletAuth() {
  const { publicKey, signMessage, signTransaction, connected } = useWallet();
  const { login, logout, isAuthenticated, address } = useSasphy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      toast.error('Wallet not connected or does not support message signing');
      return false;
    }

    setIsLoggingIn(true);
    try {
      // 1. Get nonce from backend
      let nonceResponse;
      try {
        nonceResponse = await fetch('/api/blockchain/auth/nonce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: publicKey.toString() })
        });
        
        if (!nonceResponse.ok) {
          throw new Error(`Failed to get nonce from server: ${nonceResponse.status}`);
        }
      } catch (e) {
        console.error('Nonce API error:', e);
        toast.error('Could not connect to authentication service. Please try again later.');
        return false;
      }
      
      const { data: nonceData } = await nonceResponse.json();
      
      if (!nonceData || !nonceData.nonce) {
        toast.error('Invalid authentication response from server');
        return false;
      }
      
      // 2. Sign the nonce
      const message = `Sign this message to verify your wallet ownership: ${nonceData.nonce}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      let signature;
      try {
        signature = await signMessage(encodedMessage);
      } catch (e) {
        console.error('Signing error:', e);
        toast.error('Signature was rejected. Please try again.');
        return false;
      }
      
      // 3. Send signature to backend to complete login
      const loginSuccess = await login(publicKey.toString(), bs58.encode(signature));
      
      if (loginSuccess) {
        toast.success('Successfully signed in!');
      } else {
        toast.error('Authentication failed. Please try again.');
      }
      
      return loginSuccess;
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('Failed to sign in. Please try again later.');
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [publicKey, signMessage, login]);

  const handleSignOut = useCallback(() => {
    logout();
    toast.info('Signed out successfully');
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
