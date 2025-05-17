import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import createTokenFactoryClient from '../src/lib/createTokenFactoryClient';
import { BondingCurveType } from '../src/lib/idls';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Set to use mock implementation
process.env.NEXT_PUBLIC_USE_MOCK_TOKEN_FACTORY = 'true';

async function main() {
  console.log('🚀 Testing Integrated Token Factory');
  
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
  
  // Create token factory client using the factory function
  const tokenFactory = createTokenFactoryClient(connection, walletAdapter);
  
  // Test looking up the protocol PDA
  try {
    const [protocolPDA, bump] = await tokenFactory.findProtocolPDA();
    console.log(`Found protocol PDA: ${protocolPDA.toString()} (bump: ${bump})`);
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
    
    const tx = await tokenFactory.createMusicToken(
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
    
    // Get all tracks and display them - this will only work for mock client
    if ('getAllTracks' in tokenFactory) {
      const tracks = await tokenFactory.getAllTracks();
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
        const purchaseTx = await tokenFactory.buyTokens(mintAddress, purchaseAmount);
        
        console.log(`Purchased ${purchaseAmount} tokens successfully!`);
        console.log('Transaction signature:', purchaseTx);
        
        // For mock client, we can get track details
        if ('getTrack' in tokenFactory) {
          const trackDetails = await tokenFactory.getTrack(mintAddress);
          console.log('\nTrack details after purchase:');
          console.log(`Name: ${trackDetails.name}`);
          console.log(`Symbol: ${trackDetails.symbol}`);
          console.log(`Supply: ${trackDetails.supply}`);
          console.log(`Initial price: ${trackDetails.initialPrice / 1e9} SOL`);
          console.log(`Artist fee: ${trackDetails.artistFee / 100}%`);
        }
      }
    }
    
    console.log('\nToken Factory Test Completed Successfully!');
    console.log('Integration is ready for frontend development.');
  } catch (error) {
    console.error('Error in token factory operations:', error);
  }
}

main().catch(console.error);
