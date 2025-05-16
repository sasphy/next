'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Program } from '@project-serum/anchor';
import { toast } from 'sonner';
import { PublicKey } from '@solana/web3.js';
import * as solanaApi from '@/api/solana';
import { useConvexAuthContext } from '@/components/providers/convex-auth-provider';
import { useMutation } from 'convex/react';
import { api } from '@/_generated/api';
import { Id } from '@/_generated/dataModel';

interface TransactionState {
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
}

/**
 * Hook for interacting with Solana token functions
 */
export function useSolanaTokens(program?: Program) {
  const { publicKey, connected } = useWallet();
  const { userId } = useConvexAuthContext();
  const [buyState, setBuyState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    txHash: null,
  });
  const [sellState, setSellState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    txHash: null,
  });
  const [createState, setCreateState] = useState<TransactionState>({
    isLoading: false,
    error: null,
    txHash: null,
  });
  
  // Convex mutation to record track ownership
  const recordOwnedTrack = useMutation(api.users.recordOwnedTrack);
  
  // Convex mutation to record created track
  const recordCreatedTrack = useMutation(api.users.recordCreatedTrack);

  /**
   * Buy tokens for a track
   */
  const buyTokens = async (
    metadataUrl: string,
    amount: number,
    maxPrice: number
  ): Promise<string | null> => {
    if (!publicKey || !connected) {
      toast.error('Wallet not connected');
      return null;
    }
    
    setBuyState({
      isLoading: true,
      error: null,
      txHash: null,
    });
    
    try {
      const txHash = await solanaApi.buyTokens(
        publicKey,
        metadataUrl,
        amount,
        maxPrice,
        program
      );
      
      // Record the purchase in Convex if user profile exists
      if (userId) {
        try {
          await recordOwnedTrack({
            userId: userId as Id<'users'>,
            trackType: 'tokenized',
            trackId: metadataUrl,
            purchasedAt: Date.now(),
            purchasePrice: maxPrice,
            tokenId: metadataUrl,
          });
        } catch (error) {
          console.error('Failed to record track purchase in Convex:', error);
          // Non-critical error, don't throw
        }
      }
      
      setBuyState({
        isLoading: false,
        error: null,
        txHash,
      });
      
      toast.success('Purchase successful!');
      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setBuyState({
        isLoading: false,
        error: errorMessage,
        txHash: null,
      });
      
      toast.error(`Purchase failed: ${errorMessage}`);
      return null;
    }
  };

  /**
   * Sell tokens for a track
   */
  const sellTokens = async (
    metadataUrl: string,
    amount: number,
    minPrice: number
  ): Promise<string | null> => {
    if (!publicKey || !connected) {
      toast.error('Wallet not connected');
      return null;
    }
    
    setSellState({
      isLoading: true,
      error: null,
      txHash: null,
    });
    
    try {
      const txHash = await solanaApi.sellTokens(
        publicKey,
        metadataUrl,
        amount,
        minPrice,
        program
      );
      
      setSellState({
        isLoading: false,
        error: null,
        txHash,
      });
      
      toast.success('Sale successful!');
      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSellState({
        isLoading: false,
        error: errorMessage,
        txHash: null,
      });
      
      toast.error(`Sale failed: ${errorMessage}`);
      return null;
    }
  };

  /**
   * Create a new tokenized track
   */
  const createTrack = async (
    metadataUrl: string,
    params: {
      curveType: string;
      initialPrice: number;
      delta: number;
      maxSupply: number;
      name: string;
      description: string;
    }
  ): Promise<string | null> => {
    if (!publicKey || !connected) {
      toast.error('Wallet not connected');
      return null;
    }
    
    setCreateState({
      isLoading: true,
      error: null,
      txHash: null,
    });
    
    try {
      const txHash = await solanaApi.initializeTrack(
        publicKey,
        metadataUrl,
        {
          curveType: params.curveType,
          initialPrice: params.initialPrice,
          delta: params.delta,
          maxSupply: params.maxSupply,
        },
        program
      );
      
      // Record the created track in Convex if user profile exists
      if (userId) {
        try {
          await recordCreatedTrack({
            userId: userId as Id<'users'>,
            trackType: 'tokenized',
            trackId: metadataUrl,
            metadataUrl,
            name: params.name,
            description: params.description,
            curveType: params.curveType,
          });
        } catch (error) {
          console.error('Failed to record created track in Convex:', error);
          // Non-critical error, don't throw
        }
      }
      
      setCreateState({
        isLoading: false,
        error: null,
        txHash,
      });
      
      toast.success('Track created successfully!');
      return txHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setCreateState({
        isLoading: false,
        error: errorMessage,
        txHash: null,
      });
      
      toast.error(`Track creation failed: ${errorMessage}`);
      return null;
    }
  };

  /**
   * Get user's token balance for a specific track
   */
  const getTokenBalance = async (metadataUrl: string): Promise<number> => {
    if (!publicKey || !connected) {
      return 0;
    }
    
    try {
      return await solanaApi.getUserTokenBalance(publicKey, metadataUrl, program);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  };

  return {
    // Transaction functions
    buyTokens,
    sellTokens,
    createTrack,
    getTokenBalance,
    
    // Transaction states
    buyState,
    sellState,
    createState,
    
    // Wallet info
    walletConnected: connected,
    walletPublicKey: publicKey,
  };
}

export default useSolanaTokens; 