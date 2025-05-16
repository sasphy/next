'use client';

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  VersionedTransaction,
} from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import { toast } from 'sonner';
import env from '@/lib/env';

/**
 * Create a Solana connection based on the selected network
 * @returns Connection instance
 */
export function getSolanaConnection(): Connection {
  const rpcUrl = env.solanaNetwork.includes('Devnet') 
    ? env.rpcUrlSolanaDevnet
    : env.rpcUrlSolanaMainnetBeta;
    
  if (!rpcUrl) {
    throw new Error(`No RPC URL configured for network: ${env.solanaNetwork}`);
  }
  
  return new Connection(rpcUrl, 'confirmed');
}

/**
 * Get the program ID for the Sasphy music token program
 * @returns Program public key
 */
export function getMusicProgramId(): PublicKey {
  try {
    return new PublicKey(env.solanaProgramId);
  } catch (error) {
    console.error('Invalid program ID:', error);
    throw new Error('Invalid Solana program ID configuration');
  }
}

/**
 * Get the admin wallet for the program
 * @returns Admin wallet public key
 */
export function getAdminWallet(): PublicKey {
  try {
    return new PublicKey(env.solanaAdminWallet);
  } catch (error) {
    console.error('Invalid admin wallet address:', error);
    throw new Error('Invalid Solana admin wallet configuration');
  }
}

/**
 * Get the treasury address for the program
 * @returns Treasury public key
 */
export function getTreasuryAddress(): PublicKey {
  try {
    return new PublicKey(env.solanaTreasuryAddress);
  } catch (error) {
    console.error('Invalid treasury address:', error);
    throw new Error('Invalid Solana treasury address configuration');
  }
}

/**
 * Get the protocol PDA
 * @returns Protocol PDA string
 */
export function getProtocolPda(): string {
  return env.solanaProtocolPda;
}

/**
 * Derive a PDA for a track
 * @param trackMetadataUrl IPFS URL of the track metadata
 * @param programId Program ID
 * @returns Track PDA public key and bump seed
 */
export async function deriveTrackPda(
  trackMetadataUrl: string,
  programId: PublicKey = getMusicProgramId()
): Promise<{ pda: PublicKey; bump: number }> {
  const seeds = [
    Buffer.from('track'),
    Buffer.from(trackMetadataUrl),
  ];
  
  const [pda, bump] = await PublicKey.findProgramAddress(seeds, programId);
  
  return { pda, bump };
}

/**
 * Initialize a track
 * This will create an instruction to initialize a track using the provided parameters
 * @param wallet User wallet publicKey
 * @param metadataUrl IPFS URL of the track metadata
 * @param params Track initialization parameters
 */
export async function initializeTrack(
  wallet: PublicKey,
  metadataUrl: string,
  params: {
    curveType: string;
    initialPrice: number;
    delta: number;
    maxSupply: number;
  },
  program: Program | undefined = undefined
): Promise<string> {
  try {
    if (!program) {
      throw new Error('Program instance not provided');
    }
    
    const connection = getSolanaConnection();
    const programId = getMusicProgramId();
    const adminWallet = getAdminWallet();
    const treasury = getTreasuryAddress();
    
    // Derive track PDA
    const { pda: trackPda } = await deriveTrackPda(metadataUrl, programId);
    
    // Create instruction
    const tx = await program.methods
      .initializeTrack({
        metadataUrl,
        curveType: params.curveType,
        initialPriceLamports: params.initialPrice * LAMPORTS_PER_SOL,
        delta: params.delta,
        maxSupply: params.maxSupply,
      })
      .accounts({
        track: trackPda,
        admin: adminWallet,
        treasury: treasury,
        creator: wallet,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error initializing track:', error);
    toast.error(`Failed to initialize track: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Buy tokens for a track
 * @param wallet User wallet publicKey
 * @param metadataUrl IPFS URL of the track metadata
 * @param amount Amount of tokens to buy
 * @param maxPrice Maximum price the user is willing to pay (with slippage)
 */
export async function buyTokens(
  wallet: PublicKey,
  metadataUrl: string,
  amount: number,
  maxPrice: number,
  program: Program | undefined = undefined
): Promise<string> {
  try {
    if (!program) {
      throw new Error('Program instance not provided');
    }
    
    const connection = getSolanaConnection();
    const programId = getMusicProgramId();
    const treasury = getTreasuryAddress();
    
    // Derive track PDA
    const { pda: trackPda } = await deriveTrackPda(metadataUrl, programId);
    
    // Create instruction
    const tx = await program.methods
      .buyTokens({
        amount,
        maxPriceLamports: maxPrice * LAMPORTS_PER_SOL,
      })
      .accounts({
        track: trackPda,
        treasury: treasury,
        buyer: wallet,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error buying tokens:', error);
    toast.error(`Failed to buy tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Sell tokens for a track
 * @param wallet User wallet publicKey
 * @param metadataUrl IPFS URL of the track metadata
 * @param amount Amount of tokens to sell
 * @param minPrice Minimum price the user is willing to accept (with slippage)
 */
export async function sellTokens(
  wallet: PublicKey,
  metadataUrl: string,
  amount: number,
  minPrice: number,
  program: Program | undefined = undefined
): Promise<string> {
  try {
    if (!program) {
      throw new Error('Program instance not provided');
    }
    
    const connection = getSolanaConnection();
    const programId = getMusicProgramId();
    const treasury = getTreasuryAddress();
    
    // Derive track PDA
    const { pda: trackPda } = await deriveTrackPda(metadataUrl, programId);
    
    // Create instruction
    const tx = await program.methods
      .sellTokens({
        amount,
        minPriceLamports: minPrice * LAMPORTS_PER_SOL,
      })
      .accounts({
        track: trackPda,
        treasury: treasury,
        seller: wallet,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error selling tokens:', error);
    toast.error(`Failed to sell tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Get track information
 * @param metadataUrl IPFS URL of the track metadata
 */
export async function getTrackInfo(
  metadataUrl: string,
  program: Program | undefined = undefined
): Promise<any> {
  try {
    if (!program) {
      throw new Error('Program instance not provided');
    }
    
    const programId = getMusicProgramId();
    
    // Derive track PDA
    const { pda: trackPda } = await deriveTrackPda(metadataUrl, programId);
    
    // Fetch track account data
    const trackData = await program.account.track.fetch(trackPda);
    
    return trackData;
  } catch (error) {
    console.error('Error fetching track info:', error);
    throw error;
  }
}

/**
 * Get user's token balance for a track
 * @param wallet User wallet publicKey
 * @param metadataUrl IPFS URL of the track metadata
 */
export async function getUserTokenBalance(
  wallet: PublicKey,
  metadataUrl: string,
  program: Program | undefined = undefined
): Promise<number> {
  try {
    if (!program) {
      throw new Error('Program instance not provided');
    }
    
    const programId = getMusicProgramId();
    
    // Derive track PDA
    const { pda: trackPda } = await deriveTrackPda(metadataUrl, programId);
    
    // Fetch track account data
    const trackData = await program.account.track.fetch(trackPda);
    
    // Find user's balance
    const userHolding = trackData.holders.find(
      (h: any) => h.wallet.toBase58() === wallet.toBase58()
    );
    
    return userHolding ? userHolding.balance : 0;
  } catch (error) {
    console.error('Error fetching user token balance:', error);
    return 0;
  }
} 