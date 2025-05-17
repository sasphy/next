import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import type { MusicTokenFactory } from '../types/music_token_factory';
import { BondingCurveType } from '../lib/idls';
import * as fs from 'fs';
import * as path from 'path';

export class MockTokenFactoryClient {
  private connection: Connection;
  private wallet: any;
  private mockTracksPath: string;
  private mockTracks: any[] = [];

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.wallet = wallet;
    this.mockTracksPath = path.resolve(process.cwd(), 'test-data', 'mock-tracks.json');
    this.loadMockTracks();
  }

  private loadMockTracks() {
    if (fs.existsSync(this.mockTracksPath)) {
      try {
        const data = fs.readFileSync(this.mockTracksPath, 'utf8');
        this.mockTracks = JSON.parse(data);
      } catch (err) {
        console.warn('Failed to load mock tracks:', err);
        this.mockTracks = [];
      }
    } else {
      console.warn('Mock tracks file not found, creating empty array');
      this.mockTracks = [];
    }
  }

  private saveMockTracks() {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.mockTracksPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.mockTracksPath, JSON.stringify(this.mockTracks, null, 2));
    } catch (err) {
      console.error('Failed to save mock tracks:', err);
    }
  }

  /**
   * Find the protocol PDA for the token factory
   */
  async findProtocolPDA(): Promise<[PublicKey, number]> {
    // Return the known protocol PDA from the documentation
    return [new PublicKey('4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM'), 255];
  }

  /**
   * Find the token factory PDA for a given mint
   */
  async findTokenFactoryPDA(mint: PublicKey): Promise<[PublicKey, number]> {
    // Create a deterministic "mock PDA" based on the mint
    const mintStr = mint.toString().substring(0, 8);
    const mockPda = `TokenFactory${mintStr}`;
    const mockPdaBytes = Buffer.from(mockPda);
    const mockPdaHash = await PublicKey.findProgramAddress(
      [mockPdaBytes],
      new PublicKey('5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV')
    );
    
    return mockPdaHash;
  }

  /**
   * Create a new music token
   */
  async createMusicToken(
    name: string,
    symbol: string,
    uri: string,
    initialPrice: number,
    increment: number,
    curveType: BondingCurveType,
    artistFee: number
  ): Promise<string> {
    // Convert to lamports (1 SOL = 1,000,000,000 lamports)
    const initialPriceLamports = initialPrice * 1_000_000_000;
    const incrementLamports = increment * 1_000_000_000;
    
    // Create a new keypair for the mint
    const mintKeypair = Keypair.generate();
    const mintAddress = mintKeypair.publicKey.toString();
    
    // Generate a mock transaction signature
    const mockTxSignature = `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    
    // Create a mock track
    const mockTrack = {
      mint: mintAddress,
      artist: this.wallet.publicKey.toString(),
      name,
      symbol,
      uri,
      initialPrice: initialPriceLamports,
      delta: incrementLamports,
      curveType,
      supply: 0,
      artistFee: artistFee * 100, // Convert to basis points
      protocol: '4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM',
      liquidityPool: mintKeypair.publicKey.toString(),
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    // Add to mock tracks
    this.mockTracks.push(mockTrack);
    this.saveMockTracks();
    
    // Log information
    console.log('Created mock music token:');
    console.log(`Mint: ${mintAddress}`);
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    
    // Return a mock transaction signature
    return mockTxSignature;
  }

  /**
   * Buy tokens for a specific track
   */
  async buyTokens(mint: PublicKey, amount: number): Promise<string> {
    // Find the track in our mock data
    const trackIndex = this.mockTracks.findIndex(t => t.mint === mint.toString());
    
    if (trackIndex === -1) {
      throw new Error(`Track with mint ${mint.toString()} not found`);
    }
    
    // Get the track
    const track = this.mockTracks[trackIndex];
    
    // Calculate price based on bonding curve
    let totalPrice = 0;
    
    for (let i = 0; i < amount; i++) {
      const currentSupply = track.supply + i;
      let tokenPrice = 0;
      
      switch (track.curveType) {
        case BondingCurveType.Linear:
          // Price = initialPrice + (supply * delta)
          tokenPrice = track.initialPrice + (currentSupply * track.delta);
          break;
          
        case BondingCurveType.Exponential:
          // Simplified exponential curve
          tokenPrice = track.initialPrice * Math.pow(1.1, currentSupply);
          break;
          
        case BondingCurveType.Logarithmic:
          // Simplified logarithmic curve
          tokenPrice = track.initialPrice * (1 + Math.log(currentSupply + 1) / 10);
          break;
          
        case BondingCurveType.Sigmoid:
          // Simplified sigmoid curve
          const midpoint = 50;
          const steepness = 0.2;
          const sigmoid = 1 / (1 + Math.exp(-steepness * (currentSupply - midpoint)));
          tokenPrice = track.initialPrice + (track.initialPrice * 9 * sigmoid);
          break;
          
        default:
          tokenPrice = track.initialPrice;
      }
      
      totalPrice += tokenPrice;
    }
    
    // Update the track's supply
    track.supply += amount;
    
    // Update the mock data
    this.mockTracks[trackIndex] = track;
    this.saveMockTracks();
    
    // Log information
    console.log(`Bought ${amount} tokens of track ${track.name}`);
    console.log(`New supply: ${track.supply}`);
    console.log(`Total price: ${totalPrice / 1_000_000_000} SOL`);
    
    // Return a mock transaction signature
    return `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Find the associated token address for a wallet and mint
   */
  async findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey> {
    // Generate a deterministic "associated token address" for mocking
    const walletStr = walletAddress.toString().substring(0, 4);
    const mintStr = tokenMintAddress.toString().substring(0, 4);
    const mockAta = `ATA${walletStr}${mintStr}`;
    const mockAtaBytes = Buffer.from(mockAta);
    const mockAtaHash = await PublicKey.findProgramAddress(
      [mockAtaBytes],
      new PublicKey('5tGHM7n1mxNEqUxEGSgC2yobV11zVUPChZ8ECEQWTwRV')
    );
    
    return mockAtaHash[0];
  }
  
  /**
   * Get track information
   */
  async getTrack(mint: PublicKey): Promise<any> {
    const track = this.mockTracks.find(t => t.mint === mint.toString());
    
    if (!track) {
      throw new Error(`Track with mint ${mint.toString()} not found`);
    }
    
    return track;
  }
  
  /**
   * Get all tracks
   */
  async getAllTracks(): Promise<any[]> {
    return this.mockTracks;
  }
  
  /**
   * Check if user owns a track
   */
  async checkOwnership(mint: PublicKey, userAddress: PublicKey): Promise<boolean> {
    // In a real implementation, this would check on-chain
    // For mock, we'll assume the user owns all tracks for testing
    return true;
  }
}

export default MockTokenFactoryClient;