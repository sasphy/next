'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSasphy } from '@/components/providers/sasphy-provider';
import bs58 from 'bs58';

/**
 * This hook manages authentication between the wallet and application
 * It provides login/logout functions and authentication state
 */
export function useWalletAuth() {
  // Add a mounted state to handle hydration
  const [mounted, setMounted] = useState(false);
  
  // Get wallet context safely to prevent errors if WalletProvider isn't mounted yet
  const wallet = useWallet();
  const publicKey = wallet?.publicKey;
  const signMessage = wallet?.signMessage;
  const signTransaction = wallet?.signTransaction;
  const connected = wallet?.connected;
  
  const { login, logout, isAuthenticated, address } = useSasphy();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sign in function using wallet signature
  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      console.warn('Wallet not connected or signMessage not available');
      return;
    }

    setIsLoggingIn(true);
    try {
      // Create a challenge message 
      const message = new TextEncoder().encode(
        `Welcome to Sasphy Music!\n\nSign this message to authenticate with your wallet.\n\nNonce: ${Date.now()}`
      );
      
      // Request signature from the wallet
      const signature = await signMessage(message);
      
      // Call login from hook/API with signature and public key
      await login(publicKey.toString(), bs58.encode(signature));
      
      console.log('Authentication successful');
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  }, [publicKey, signMessage, login]);

  // Sign out function
  const signOut = useCallback(async () => {
    try {
      await logout();
      console.log('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [logout]);

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (!mounted) return; // Skip during SSR
    
    // If wallet is connected but user is not authenticated, attempt sign in
    if (connected && publicKey && !isAuthenticated && !isLoggingIn) {
      // Consider adding a user preference check before auto sign-in
      // signIn();
    }
  }, [connected, publicKey, isAuthenticated, isLoggingIn, signIn, mounted]);

  // Return default values if not mounted
  if (!mounted) {
    return {
      signIn,
      signOut,
      isLoggingIn,
      isWalletConnected: false,
      isAuthenticated: false,
    };
  }

  return {
    signIn,
    signOut,
    isLoggingIn,
    isWalletConnected: !!connected,
    isAuthenticated,
  };
}

export default useWalletAuth;
