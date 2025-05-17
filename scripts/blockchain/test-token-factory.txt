#!/usr/bin/env bun
/**
 * Test script to create a token using the TokenFactoryClient
 * 
 * Usage:
 *   bun run scripts/blockchain/test-token-factory.ts
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { BondingCurveType } from '../../src/lib/idls';
import { TokenFactoryClient } from '../../src/lib/TokenFactoryClient';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('Testing TokenFactoryClient...');
  
  // Get private key from .env.local
  const privateKeyString = process.env.PRIVATE_KEY;
  if (!privateKeyString) {
    console.error('No PRIVATE_KEY found in .env.local');
    process.exit(1);
  }
  
  // Parse private key
  let privateKeyArray: number[];
  try {
    privateKeyArray = JSON.parse(privateKeyString);
  } catch (error) {
    console.error('Error parsing PRIVATE_KEY from .env.local:', error);
    process.exit(1);
  }
  
  // Create keypair from private key
  const keypair = Keypair.fromSecretKey(Uint8Array.from(privateKeyArray));
  console.log('Using wallet:', keypair.publicKey.toString());
  
  // Connect to Solana devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  console.log('Connected to Solana devnet');
  
  // Check wallet balance
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`Wallet balance: ${balance / 1e9} SOL`);
  
  if (balance < 0.1 * 1e9) {
    console.warn('Warning: Low balance. Consider requesting an airdrop.');
  }
  
  // Create wallet adapter for TokenFactoryClient (simulated Wallet Adapter)
  const walletAdapter = {
    publicKey: keypair.publicKey,
    signTransaction: async (tx) => {
      tx.sign(keypair);
      return tx;
    },
    signAllTransactions: async (txs) => {
      return txs.map(tx => {
        tx.sign(keypair);
        return tx;
      });
    },
    signMessage: async (message) => {
      return keypair.sign(message).signature;
    }
  };
  
  // Create TokenFactoryClient
  const client = new TokenFactoryClient(connection, walletAdapter);
  console.log('TokenFactoryClient created');
  
  // Create a new music token
  try {
    console.log('Creating a new music token...');
    const trackName = `Test Track ${Date.now().toString().slice(-6)}`;
    
    const tx = await client.createMusicToken(
      trackName,
      'TEST',
      'https://arweave.net/test-metadata',
      0.01, // initial price in SOL
      0.001, // price increment in SOL
      BondingCurveType.Linear,
      5 // 5% artist fee
    );
    
    console.log('Track created successfully!');
    console.log('Transaction signature:', tx);
    
    // Create a file to store the track info
    const trackInfo = {
      name: trackName,
      txSignature: tx,
      creator: keypair.publicKey.toString(),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.resolve(process.cwd(), 'scripts', 'blockchain', 'track-info.json'),
      JSON.stringify(trackInfo, null, 2)
    );
    
    console.log('Track info saved to scripts/blockchain/track-info.json');
    
  } catch (error) {
    console.error('Error creating track:', error);
  }
}

main().catch(console.error);