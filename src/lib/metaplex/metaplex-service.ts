'use client';

import { 
  Metaplex, 
  keypairIdentity, 
  irysStorage, 
  walletAdapterIdentity,
  toMetaplexFile,
  CreatorInput,
  CreateNftInput
} from '@metaplex-foundation/js';
import { Connection, clusterApiUrl, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

export interface MusicNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image?: File;
  imageUrl?: string;
  audioFile?: File;
  audioUrl?: string;
  externalUrl?: string;
  royalty?: number;
  attributes?: {
    trait_type?: string;
    value?: string | number;
    [key: string]: unknown;
  }[];
  sellerFeeBasisPoints?: number;
  creators?: CreatorInput[];
}

export class MetaplexService {
  private metaplex: Metaplex;
  private connection: Connection;

  constructor(connection: Connection, wallet: WalletContextState) {
    this.connection = connection;
    this.metaplex = Metaplex.make(connection)
      .use(walletAdapterIdentity(wallet));
  }

  static create(wallet: WalletContextState, endpoint?: string) {
    const connection = new Connection(
      endpoint || process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('devnet'),
      'confirmed'
    );
    return new MetaplexService(connection, wallet);
  }

  async createMusicNFT(metadata: MusicNFTMetadata, mintMultiple: number = 1) {
    try {
      // Process files if provided
      let imageMetaplexFile;
      let audioMetaplexFile;
      let imageUri;
      let audioUri;

      if (metadata.image) {
        imageMetaplexFile = await this.fileToMetaplexFile(
          metadata.image, 
          metadata.image.name
        );
        const imageUploadResult = await this.metaplex.storage().upload(imageMetaplexFile);
        imageUri = imageUploadResult;
      } else if (metadata.imageUrl) {
        imageUri = metadata.imageUrl;
      }

      if (metadata.audioFile) {
        audioMetaplexFile = await this.fileToMetaplexFile(
          metadata.audioFile, 
          metadata.audioFile.name
        );
        const audioUploadResult = await this.metaplex.storage().upload(audioMetaplexFile);
        audioUri = audioUploadResult;
      } else if (metadata.audioUrl) {
        audioUri = metadata.audioUrl;
      }

      // Format traits/attributes with proper type handling
      const formattedAttributes = (metadata.attributes || []).map(attr => {
        // Handle optional or missing fields
        const traitType = attr.trait_type || '';
        let value = '';
        
        // Convert numbers to strings for Metaplex compatibility
        if (attr.value !== undefined) {
          value = typeof attr.value === 'number' 
            ? String(attr.value) 
            : String(attr.value || '');
        }
        
        return {
          trait_type: traitType,
          value: value
        };
      });
      
      // Add audio specific attributes if audio is provided
      if (audioUri) {
        formattedAttributes.push({
          trait_type: 'audio_url',
          value: audioUri
        });
      }

      // Create NFT metadata JSON
      const metadataJson = {
        name: metadata.name,
        symbol: metadata.symbol,
        description: metadata.description,
        image: imageUri,
        animation_url: audioUri, // This will be used for the audio file
        external_url: metadata.externalUrl,
        attributes: formattedAttributes,
        properties: {
          files: [
            ...(imageUri ? [{ uri: imageUri, type: 'image/jpeg' }] : []),
            ...(audioUri ? [{ uri: audioUri, type: 'audio/mp3' }] : [])
          ],
          category: 'audio',
        }
      };

      // Upload metadata JSON
      const { uri } = await this.metaplex.nfts().uploadMetadata(metadataJson);

      // Create the NFT
      const { nft } = await this.metaplex.nfts().create({
        uri,
        name: metadata.name,
        sellerFeeBasisPoints: metadata.sellerFeeBasisPoints || 500, // 5% default royalty
        symbol: metadata.symbol,
        creators: metadata.creators,
        maxSupply: mintMultiple > 1 ? mintMultiple : null, // If mintMultiple > 1, set maxSupply
        isMutable: true,
      });

      return nft;
    } catch (error) {
      console.error('Error creating music NFT:', error);
      throw error;
    }
  }

  async fileToMetaplexFile(file: File, fileName: string): Promise<any> {
    const buffer = await file.arrayBuffer();
    const array = new Uint8Array(buffer);
    return toMetaplexFile(array, fileName);
  }

  async fetchNFTsByOwner(owner: PublicKey) {
    try {
      const nfts = await this.metaplex.nfts().findAllByOwner({
        owner,
      });
      
      // Filter for NFTs with animation_url (which would be our music NFTs)
      const musicNFTs = await Promise.all(
        nfts.map(async (nft) => {
          try {
            if (nft.uri) {
              const metadata = await fetch(nft.uri).then(res => res.json());
              if (metadata.animation_url || metadata.properties?.category === 'audio') {
                return {
                  ...nft,
                  metadata
                };
              }
            }
            return null;
          } catch (error) {
            console.error('Error fetching NFT metadata:', error);
            return null;
          }
        })
      );
      
      return musicNFTs.filter(Boolean);
    } catch (error) {
      console.error('Error fetching NFTs by owner:', error);
      throw error;
    }
  }

  async fetchNFTMetadata(mintAddress: PublicKey) {
    try {
      const nft = await this.metaplex.nfts().findByMint({
        mintAddress,
      });
      
      if (nft.uri) {
        const metadata = await fetch(nft.uri).then(res => res.json());
        return {
          ...nft,
          metadata
        };
      }
      
      return nft;
    } catch (error) {
      console.error('Error fetching NFT metadata:', error);
      throw error;
    }
  }
}
