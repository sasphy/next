'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo, useCallback } from 'react';
import { MetaplexService, MusicNFTMetadata } from '@/lib/metaplex/metaplex-service';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';

export const useMetaplex = () => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const metaplexService = useMemo(() => {
    if (!wallet || !connection) return null;
    return MetaplexService.create(wallet, connection.rpcEndpoint);
  }, [wallet, connection]);

  const createMusicNFT = useCallback(async (
    metadata: MusicNFTMetadata, 
    mintMultiple: number = 1,
    onSuccess?: (mintAddress: string) => void,
    onError?: (error: any) => void
  ) => {
    if (!metaplexService) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      const nft = await metaplexService.createMusicNFT(metadata, mintMultiple);
      
      toast.success(`Successfully created NFT: ${nft.name}`);
      onSuccess?.(nft.address.toString());
      
      return nft;
    } catch (error) {
      console.error('Error creating music NFT:', error);
      toast.error('Failed to create music NFT');
      onError?.(error);
      return null;
    }
  }, [metaplexService]);

  const fetchNFTsByOwner = useCallback(async (
    owner?: PublicKey,
    onSuccess?: (nfts: any[]) => void,
    onError?: (error: any) => void
  ) => {
    if (!metaplexService) {
      toast.error('Wallet not connected');
      return [];
    }

    try {
      const ownerPublicKey = owner || wallet.publicKey;
      
      if (!ownerPublicKey) {
        toast.error('No owner public key provided');
        return [];
      }
      
      const nfts = await metaplexService.fetchNFTsByOwner(ownerPublicKey);
      
      onSuccess?.(nfts);
      return nfts;
    } catch (error) {
      console.error('Error fetching NFTs by owner:', error);
      toast.error('Failed to fetch NFTs');
      onError?.(error);
      return [];
    }
  }, [metaplexService, wallet.publicKey]);

  const fetchNFTMetadata = useCallback(async (
    mintAddress: string,
    onSuccess?: (nft: any) => void,
    onError?: (error: any) => void
  ) => {
    if (!metaplexService) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      const publicKey = new PublicKey(mintAddress);
      const nft = await metaplexService.fetchNFTMetadata(publicKey);
      
      onSuccess?.(nft);
      return nft;
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      toast.error('Failed to fetch NFT metadata');
      onError?.(error);
      return null;
    }
  }, [metaplexService]);

  return {
    metaplexService,
    createMusicNFT,
    fetchNFTsByOwner,
    fetchNFTMetadata,
    isReady: !!metaplexService,
  };
};
