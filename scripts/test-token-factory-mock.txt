import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { BondingCurveType } from '../src/lib/idls';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Testing SolBeat Token Factory Integration with Mock Implementation');
  
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
  
  // Simulate protocol PDA
  const protocolPDA = new PublicKey("4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM");
  console.log(`Protocol PDA: ${protocolPDA.toString()}`);
  
  // Simulate factory token
  const factoryToken = new PublicKey("A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK");
  console.log(`Factory Token: ${factoryToken.toString()}`);
  
  // Mock creating a new track
  try {
    // Generate test track data
    const trackName = `Test Track ${Math.floor(Math.random() * 1000)}`;
    const trackSymbol = 'TEST';
    const trackUri = 'https://arweave.net/test-metadata';
    const initialPrice = 0.01; // 0.01 SOL
    const increment = 0.001; // 0.001 SOL
    const artistFee = 5; // 5%
    const curveType = BondingCurveType.Linear;
    
    console.log(`Creating mock track: ${trackName}`);
    console.log(`Initial price: ${initialPrice} SOL`);
    console.log(`Price increment: ${increment} SOL`);
    console.log(`Artist fee: ${artistFee}%`);
    console.log(`Curve type: ${curveType === BondingCurveType.Linear ? 'Linear' : 
                               curveType === BondingCurveType.Exponential ? 'Exponential' :
                               curveType === BondingCurveType.Logarithmic ? 'Logarithmic' : 'Sigmoid'}`);
    
    // Generate a mock mint address (normally this would come from a real transaction)
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey.toString();
    
    // Generate a mock transaction signature
    const mockTxSignature = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Create a mock track data structure (similar to what would be stored on-chain)
    const mockTrack = {
      mint: mintAddress,
      artist: wallet.publicKey.toString(),
      name: trackName,
      symbol: trackSymbol,
      uri: trackUri,
      initialPrice: initialPrice * 1e9, // Convert to lamports
      delta: increment * 1e9, // Convert to lamports
      curveType: curveType,
      supply: 0,
      artistFee: artistFee * 100, // Convert to basis points
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    // Save the mock track data to a file for future reference
    const mockTrackFile = path.resolve(process.cwd(), 'test-data', 'mock-tracks.json');
    
    // Create test-data directory if it doesn't exist
    const testDataDir = path.resolve(process.cwd(), 'test-data');
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
    
    // Read existing tracks or create a new array
    let mockTracks = [];
    if (fs.existsSync(mockTrackFile)) {
      try {
        const existingData = fs.readFileSync(mockTrackFile, 'utf8');
        mockTracks = JSON.parse(existingData);
      } catch (err) {
        console.warn('Error reading existing mock tracks:', err);
      }
    }
    
    // Add the new track and save
    mockTracks.push(mockTrack);
    fs.writeFileSync(mockTrackFile, JSON.stringify(mockTracks, null, 2));
    
    console.log('Mock track created successfully!');
    console.log('Mint address:', mintAddress);
    console.log('Transaction signature:', mockTxSignature);
    console.log('Track data saved to:', mockTrackFile);
    
    // Give instructions for next steps
    console.log('\nNext Steps:');
    console.log('1. Update your frontend to use the mock mint address');
    console.log('2. Test the frontend integration using this mock data');
    console.log('3. When the real Solana program is deployed, switch to using that');
    
  } catch (error) {
    console.error('Error creating mock track:', error);
  }
}

main().catch(console.error);
