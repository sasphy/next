import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@project-serum/anchor';
import { IDL } from '@/lib/idls/music_token_factory';
import { BondingCurveType } from '@/lib/types';

// Constants
export const PROGRAM_ID = new PublicKey('5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV');
export const TREASURY_ADDRESS = new PublicKey('9RgXRzRWMAvfjunEUK8QCJ5WGs8oVreTfXtVyAvABVBb');

// Convert bonding curve type to the enum values expected by the program
function getBondingCurveTypeEnum(curveType: BondingCurveType): number {
  switch (curveType) {
    case 'LINEAR':
      return 0;
    case 'EXPONENTIAL':
      return 1;
    case 'LOGARITHMIC':
      return 2;
    case 'SIGMOID':
      return 3;
    default:
      return 0; // Default to LINEAR
  }
}

/**
 * Create a new music token using the token factory contract
 */
export async function createMusicToken(
  connection: Connection,
  wallet: Wallet,
  params: {
    name: string;
    symbol: string;
    metadataUri: string;
    initialPrice: number;
    delta: number;
    curveType: BondingCurveType;
  }
) {
  try {
    // Create the provider
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    // Create the program
    const program = new Program(IDL, PROGRAM_ID, provider);

    // Convert price from SOL to lamports
    const priceInLamports = new BN(params.initialPrice * 1_000_000_000);
    const deltaValue = new BN(params.delta * 1_000_000_000);

    // Get the curve type enum value
    const curveTypeEnum = getBondingCurveTypeEnum(params.curveType);

    // Create the music token
    const tx = await program.methods
      .createMusicToken(
        params.name,
        params.symbol,
        params.metadataUri,
        priceInLamports,
        deltaValue,
        { [params.curveType.toLowerCase()]: {} } // This maps to the enum variant in Rust
      )
      .accounts({
        payer: wallet.publicKey,
        treasury: TREASURY_ADDRESS,
        // Other accounts will be resolved by the program
      })
      .rpc();

    console.log('Transaction signature:', tx);
    return {
      success: true,
      signature: tx
    };
  } catch (error) {
    console.error("Error creating music token:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Buy tokens for a given music token
 */
export async function buyTokens(
  connection: Connection,
  wallet: Wallet,
  params: {
    tokenAddress: string;
    amount: number;
    maxPrice?: number;
  }
) {
  try {
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    const program = new Program(IDL, PROGRAM_ID, provider);
    const tokenAddress = new PublicKey(params.tokenAddress);
    const amountBN = new BN(params.amount);
    const maxPriceBN = params.maxPrice 
      ? new BN(params.maxPrice * 1_000_000_000) 
      : null;

    const tx = await program.methods
      .buyTokens(
        amountBN,
        maxPriceBN
      )
      .accounts({
        buyer: wallet.publicKey,
        musicToken: tokenAddress,
        // Other accounts will be resolved by the program
      })
      .rpc();

    console.log('Transaction signature:', tx);
    return {
      success: true,
      signature: tx
    };
  } catch (error) {
    console.error("Error buying tokens:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Sell tokens for a given music token
 */
export async function sellTokens(
  connection: Connection,
  wallet: Wallet,
  params: {
    tokenAddress: string;
    amount: number;
    minPrice?: number;
  }
) {
  try {
    const provider = new AnchorProvider(
      connection,
      wallet,
      { commitment: 'confirmed' }
    );

    const program = new Program(IDL, PROGRAM_ID, provider);
    const tokenAddress = new PublicKey(params.tokenAddress);
    const amountBN = new BN(params.amount);
    const minPriceBN = params.minPrice 
      ? new BN(params.minPrice * 1_000_000_000) 
      : null;

    const tx = await program.methods
      .sellTokens(
        amountBN,
        minPriceBN
      )
      .accounts({
        seller: wallet.publicKey,
        musicToken: tokenAddress,
        // Other accounts will be resolved by the program
      })
      .rpc();

    console.log('Transaction signature:', tx);
    return {
      success: true,
      signature: tx
    };
  } catch (error) {
    console.error("Error selling tokens:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 