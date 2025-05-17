import type { MusicTokenFactory } from '../../types/music_token_factory';
import MusicTokenFactoryIDL from './music_token_factory.json';

// Export the IDL with proper TypeScript types
export const MUSIC_TOKEN_FACTORY_IDL = MusicTokenFactoryIDL as unknown as MusicTokenFactory;

// Export key program addresses
export const MUSIC_TOKEN_FACTORY_PROGRAM_ID = '5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV';
export const MUSIC_STREAMING_PROGRAM_ID = '7M4auRXNK8StXzMUnj5qTYUUdD5btx3i7VJRjy8LyoqF';
export const FACTORY_TOKEN_MINT = 'A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK';
export const PROTOCOL_PDA = '4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM';
export const TREASURY_WALLET = 'FXHUWiWF2QcjnZ9qCkxrzKpjuwzgr3e8acCPV4sKPRSV';
export const ADMIN_WALLET = '7vCWanYCd848kSEqEbZUuamhgFhnKqDh4b2TC1fVEGg9';

// Export bonding curve types
export enum BondingCurveType {
  Linear = 0,
  Exponential = 1,
  Logarithmic = 2,
  Sigmoid = 3
}

// Export IDLs for music programs
import MusicStreamingIDL from './music_streaming.json';

// Export IDLs for use in the application
export const MUSIC_STREAMING_IDL = MusicStreamingIDL;

// Sample code to connect to the program
// 
// import { Connection, PublicKey } from '@solana/web3.js';
// import { Program, AnchorProvider } from '@project-serum/anchor';
// import { useAnchorWallet } from '@solana/wallet-adapter-react';
// import { MUSIC_TOKEN_FACTORY_IDL, MUSIC_TOKEN_FACTORY_PROGRAM_ID } from '../lib/idls';
//
// const connection = new Connection('https://api.devnet.solana.com');
// const wallet = useAnchorWallet();
// const provider = new AnchorProvider(connection, wallet, {});
// const programId = new PublicKey(MUSIC_TOKEN_FACTORY_PROGRAM_ID);
// const program = new Program(MUSIC_TOKEN_FACTORY_IDL, programId, provider);
