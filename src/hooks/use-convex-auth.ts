'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/_generated/api';
import { Id } from '@/_generated/dataModel';

/**
 * This hook bridges Solana wallet connections with Convex persistent profiles
 * It ensures that when a wallet connects, a corresponding user profile exists in Convex
 */
export function useConvexAuth() {
  // Add a mounted state to handle hydration
  const [mounted, setMounted] = useState(false);
  
  // Get wallet context safely to prevent errors if WalletProvider isn't mounted yet
  const wallet = useWallet();
  // Safely access wallet properties with optional chaining and nullish coalescing
  const publicKey = wallet?.publicKey ?? null;
  const connected = wallet?.connected ?? false;
  
  const [userId, setUserId] = useState<Id<'users'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set mounted state after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const walletAddress = publicKey?.toString();
  
  // Query to find a user by wallet address - skip if not mounted or no wallet address
  const userQuery = useQuery(
    api.users.getByWalletAddress, 
    mounted && walletAddress ? { walletAddress } : 'skip'
  );
  
  // Mutation to create or update a user
  const upsertUser = useMutation(api.users.upsertUserFromWallet);

  useEffect(() => {
    // Skip all processing if component is not mounted yet
    if (!mounted) return;
    
    const syncUser = async () => {
      setIsLoading(true);
      
      try {
        // If wallet is connected but no user profile exists, create one
        if (connected && walletAddress && userQuery === null) {
          console.log('Creating user profile for wallet:', walletAddress);
          const newUserId = await upsertUser({
            walletAddress,
            // You can pass additional profile details here if available
          });
          setUserId(newUserId);
        } 
        // If user profile exists, store its ID
        else if (userQuery) {
          setUserId(userQuery._id);
        } 
        // If wallet is disconnected, clear user ID
        else if (!connected) {
          setUserId(null);
        }
      } catch (error) {
        console.error('Error syncing user with wallet:', error);
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();
  }, [connected, walletAddress, userQuery, upsertUser, mounted]);

  // Return default values if not mounted
  if (!mounted) {
    return {
      userId: null,
      isLoading: true,
      user: null,
      isAuthenticated: false,
    };
  }

  return {
    userId,
    isLoading,
    user: userQuery,
    isAuthenticated: !!userId && !!connected,
  };
}

export default useConvexAuth; 