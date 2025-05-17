import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@project-serum/anchor';
import type { MusicTokenFactory } from '../types/music_token_factory';
import { 
  MUSIC_TOKEN_FACTORY_IDL, 
  MUSIC_TOKEN_FACTORY_PROGRAM_ID,
  PROTOCOL_PDA,
  BondingCurveType
} from '../lib/idls';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

export class TokenFactoryClient {
  private program: Program<MusicTokenFactory>;
  private connection: Connection;
  private wallet: any;
  private provider: AnchorProvider;

  constructor(connection: Connection, wallet: any) {
    this.connection = connection;
    this.wallet = wallet;
    this.provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
    
    const programId = new PublicKey(MUSIC_TOKEN_FACTORY_PROGRAM_ID);
    this.program = new Program(MUSIC_TOKEN_FACTORY_IDL, programId, this.provider);
  }

  /**
   * Find the protocol PDA for the token factory
   */
  async findProtocolPDA(): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('protocol_settings')],
      this.program.programId
    );
  }

  /**
   * Find the token factory PDA for a given mint
   */
  async findTokenFactoryPDA(mint: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [Buffer.from('token_factory'), mint.toBuffer()],
      this.program.programId
    );
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
  ) {
    // Convert to lamports (1 SOL = 1,000,000,000 lamports)
    const initialPriceLamports = initialPrice * 1_000_000_000;
    const incrementLamports = increment * 1_000_000_000;
    
    // Create a new keypair for the mint
    const mintKeypair = Keypair.generate();
    
    // Get the protocol PDA
    const [protocolPDA] = await this.findProtocolPDA();
    
    // Get the token factory PDA for this mint
    const [tokenFactoryPDA] = await this.findTokenFactoryPDA(mintKeypair.publicKey);
    
    // Create a liquidity pool keypair
    const liquidityPoolKeypair = Keypair.generate();
    
    // Create transaction to create liquidity pool account
    const createLiquidityPoolTx = new web3.Transaction().add(
      web3.SystemProgram.createAccount({
        fromPubkey: this.wallet.publicKey,
        newAccountPubkey: liquidityPoolKeypair.publicKey,
        lamports: await this.connection.getMinimumBalanceForRentExemption(0),
        space: 0,
        programId: web3.SystemProgram.programId
      })
    );
    
    // Send and confirm transaction
    await this.provider.sendAndConfirm(createLiquidityPoolTx, [liquidityPoolKeypair]);
    
    // Now create the music token
    return await this.program.methods
      .createMusicToken(
        name,
        symbol,
        uri,
        new BN(initialPriceLamports),
        new BN(incrementLamports),
        { linear: {} },
        artistFee * 100 // Convert from percentage to basis points (e.g., 5% = 500 basis points)
      )
      .accounts({
        artist: this.wallet.publicKey,
        tokenFactory: tokenFactoryPDA,
        mint: mintKeypair.publicKey,
        protocol: protocolPDA,
        liquidityPool: liquidityPoolKeypair.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY
      })
      .signers([mintKeypair])
      .rpc();
  }

  /**
   * Buy tokens for a specific track
   */
  async buyTokens(mint: PublicKey, amount: number) {
    // Get the token factory PDA for this mint
    const [tokenFactoryPDA] = await this.findTokenFactoryPDA(mint);
    
    // Get token factory data
    const tokenFactory = await this.program.account.musicTokenFactory.fetch(tokenFactoryPDA);
    
    // Get the protocol PDA
    const [protocolPDA] = await this.findProtocolPDA();
    
    // Get protocol data
    const protocol = await this.program.account.protocolSettings.fetch(protocolPDA);
    
    // Get buyer token account
    const buyerTokenAccount = await this.findAssociatedTokenAddress(
      this.wallet.publicKey,
      mint
    );
    
    // Execute the buy transaction
    return await this.program.methods
      .buyTokens(new BN(amount))
      .accounts({
        buyer: this.wallet.publicKey,
        tokenFactory: tokenFactoryPDA,
        mint: mint,
        buyerTokenAccount: buyerTokenAccount,
        protocol: protocolPDA,
        artist: tokenFactory.artist,
        treasury: protocol.treasury,
        liquidityPool: tokenFactory.liquidityPool,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: web3.SystemProgram.programId,
        rent: web3.SYSVAR_RENT_PUBKEY
      })
      .rpc();
  }

  /**
   * Find the associated token address for a wallet and mint
   */
  async findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey
  ): Promise<PublicKey> {
    return (
      await PublicKey.findProgramAddress(
        [
          walletAddress.toBuffer(),
          TOKEN_PROGRAM_ID.toBuffer(),
          tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )[0];
  }
}

export default TokenFactoryClient;