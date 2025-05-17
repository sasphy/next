import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { BondingCurveType } from '../src/lib/idls';
import MockTokenFactoryClient from '../src/lib/MockTokenFactoryClient';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Testing SolBeat Token Factory Integration');
  
  // Set up Solana connection to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  console.log('Connected to Solana devnet');
  
  // Load the private key from environment variable
  const privateKeyString = process.env.PRIVATE_KEY;
  
  if (!privateKeyString) {
    console.error('Error: PRIVATE_KEY not found in .env.local');
    process.exit(1);
  }
  
  // Parse the private key string
  const privateKeyArray = JSON.parse(privateKeyString);
  const secretKey = new Uint8Array(privateKeyArray);
  const wallet = Keypair.fromSecretKey(secretKey);
  
  console.log(`Using wallet: ${wallet.publicKey.toString()}`);
  
  // Check wallet balance
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`Wallet balance: ${balance / 1e9} SOL`);
  
  if (balance < 0.1 * 1e9) {
    console.warn('Warning: Wallet balance is low. You may need more SOL for transactions.');
  }
  
  // Create a wallet adapter for the token factory client
  const walletAdapter = {
    publicKey: wallet.publicKey,
    signTransaction: async (tx) => {
      tx.partialSign(wallet);
      return tx;
    },
    signAllTransactions: async (txs) => {
      return txs.map(tx => {
        tx.partialSign(wallet);
        return tx;
      });
    }
  };
  
  // Create mock token factory client
  const tokenFactoryClient = new MockTokenFactoryClient(connection, walletAdapter);
  
  // Test looking up the protocol PDA
  try {
    const [protocolPDA, bump] = await tokenFactoryClient.findProtocolPDA();
    console.log(`Found protocol PDA: ${protocolPDA.toString()} (bump: ${bump})`);
    
    // Check if this matches what we expect
    const expectedPDA = process.env.NEXT_PUBLIC_SOLANA_PROTOCOL_PDA;
    if (expectedPDA && protocolPDA.toString() !== expectedPDA) {
      console.warn(`Warning: Found PDA ${protocolPDA.toString()} doesn't match expected ${expectedPDA}`);
    }
  } catch (error) {
    console.error('Error finding protocol PDA:', error);
  }
  
  // Test creating a new track
  try {
    const trackName = `Test Track ${Math.floor(Math.random() * 1000)}`;
    const trackSymbol = 'TEST';
    const trackUri = 'https://arweave.net/test-metadata';
    const initialPrice = 0.01; // 0.01 SOL
    const increment = 0.001; // 0.001 SOL
    const artistFee = 5; // 5%
    
    console.log(`Creating new track: ${trackName}`);
    console.log(`Initial price: ${initialPrice} SOL`);
    console.log(`Price increment: ${increment} SOL`);
    console.log(`Artist fee: ${artistFee}%`);
    
    const tx = await tokenFactoryClient.createMusicToken(
      trackName,
      trackSymbol,
      trackUri,
      initialPrice,
      increment,
      BondingCurveType.Linear,
      artistFee
    );
    
    console.log('Track created successfully!');
    console.log('Transaction signature:', tx);
    
    // Get all tracks and display them
    const tracks = await tokenFactoryClient.getAllTracks();
    console.log('\nAll tracks:');
    tracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.name} (${track.symbol}) - Mint: ${track.mint}`);
    });
    
    // If we have at least one track, test buying tokens
    if (tracks.length > 0) {
      const latestTrack = tracks[tracks.length - 1];
      const mintAddress = new PublicKey(latestTrack.mint);
      
      console.log(`\nTesting token purchase for track: ${latestTrack.name}`);
      const purchaseAmount = 2;
      const purchaseTx = await tokenFactoryClient.buyTokens(mintAddress, purchaseAmount);
      
      console.log(`Purchased ${purchaseAmount} tokens successfully!`);
      console.log('Transaction signature:', purchaseTx);
    }
  } catch (error) {
    console.error('Error in token factory operations:', error);
  }
}

main().catch(console.error);
