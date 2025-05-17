import { PinataSDK } from 'pinata';
import env from '@/lib/env';

/**
 * IPFS Storage utility for Sasphy Music Platform
 * Uses Pinata for IPFS uploads
 */

interface MetadataObject {
  name: string;
  symbol: string;
  description: string;
  genre: string;
  artist: string;
  artistAddress: string;
  initialPrice?: string;
  finalPrice?: string;
  maxSupply?: string;
  curveType?: string;
  delta: string;
  image?: string;
  animation_url?: string;
}

interface IPFSResult {
  metadataUrl: string;
  audioUrl: string;
  imageUrl: string;
  metadataHash: string;
  audioHash: string;
  imageHash: string;
}

// Define metadata interface
interface TrackMetadata {
  name: string;
  symbol: string;
  description: string;
  genre: string;
  artist: string;
  artistAddress: string;
  audio: string;
  image: string;
  created_at: string;
  initialPrice?: string;
  finalPrice?: string;
  maxSupply?: string;
  curveType?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
  properties: {
    files: Array<{
      uri: string;
      type: string;
      cdn?: boolean;
    }>;
    category?: string;
    creators?: Array<{
      address: string;
      share: number;
    }>;
  };
  [key: string]: unknown;
}

// Initialize Pinata client
let pinata: PinataSDK | null = null;

/**
 * Initialize the Pinata client
 */
export const initializePinata = () => {
  try {
    // Check client-side access to Pinata
    const pinataJwt = env.pinataJwt;
    
    // Set up default gateway URL
    let gatewayUrl = env.gatewayUrl || 'https://gateway.pinata.cloud';
    
    // Format the gateway URL properly
    if (gatewayUrl) {
      // Remove trailing slashes
      gatewayUrl = gatewayUrl.replace(/\/+$/, '');
      // Remove /ipfs suffix if present
      gatewayUrl = gatewayUrl.replace(/\/ipfs$/, '');
    }
    
    // Check if JWT is available
    if (!pinataJwt) {
      console.warn('Pinata JWT not found in environment. To fix this:');
      console.warn('1. Create a .env.local file in the project root');
      console.warn('2. Add PINATA_JWT=your_jwt_token_here');
      console.warn('Using API proxy fallback for now...');
      return;
    }
    
    // Set up API endpoints and client configuration
    const pinataEndpoints = {
      pinFileToIPFS: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
      pinJSONToIPFS: 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
    };
    
    return {
      pinataJwt,
      gatewayUrl,
      pinataEndpoints
    };
  } catch (error) {
    console.error('Error initializing Pinata client:', error);
    return null;
  }
};

/**
 * Ensure Pinata is initialized
 */
export const ensurePinataInitialized = () => {
  if (!pinata) {
    initializePinata();
    if (!pinata) {
      throw new Error('Failed to initialize Pinata client. Check your API credentials.');
    }
  }
  return pinata;
};

/**
 * Upload a file to IPFS via Pinata
 */
export const uploadFileToIPFS = async (file: File): Promise<{ ipfsHash: string; url: string }> => {
  try {
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Call our proxy API endpoint
    const response = await fetch('/api/ipfs-proxy/upload', {
      method: 'POST',
      body: formData,
    });
    
    // Check for errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error uploading to IPFS');
    }
    
    // Parse response
    const data = await response.json();
    
    // Get the gateway URL
    const pinataConfig = initializePinata();
    const gatewayUrl = pinataConfig?.gatewayUrl || 'gateway.pinata.cloud';
    
    // Format URL properly
    const url = `https://${gatewayUrl}/ipfs/${data.IpfsHash}`;
    
    return {
      ipfsHash: data.IpfsHash,
      url
    };
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

/**
 * Upload JSON metadata to IPFS via Pinata
 */
export const uploadJsonToIPFS = async (metadata: any): Promise<{ ipfsHash: string; url: string }> => {
  try {
    // Call our proxy API endpoint
    const response = await fetch('/api/ipfs-proxy/upload-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata }),
    });
    
    // Check for errors
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error uploading metadata to IPFS');
    }
    
    // Parse response
    const data = await response.json();
    
    // Get the gateway URL
    const pinataConfig = initializePinata();
    const gatewayUrl = pinataConfig?.gatewayUrl || 'gateway.pinata.cloud';
    
    // Format URL properly
    const url = `https://${gatewayUrl}/ipfs/${data.IpfsHash}`;
    
    return {
      ipfsHash: data.IpfsHash,
      url
    };
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw error;
  }
};

/**
 * Upload a track and its metadata to IPFS using Pinata
 */
export async function uploadTrackToIPFS(
  audioFile: File, 
  imageFile: File, 
  metadata: MetadataObject
): Promise<IPFSResult> {
  try {
    // First upload the audio and image files
    const audioResult = await uploadFileToIPFS(audioFile);
    const imageResult = await uploadFileToIPFS(imageFile);
    
    // Add the URLs to the metadata
    const metadataWithLinks = {
      ...metadata,
      image: imageResult.url,
      animation_url: audioResult.url
    };
    
    // Upload the metadata to IPFS
    const metadataResult = await uploadJsonToIPFS(metadataWithLinks);
    
    return {
      metadataUrl: metadataResult.url,
      audioUrl: audioResult.url,
      imageUrl: imageResult.url,
      metadataHash: metadataResult.ipfsHash,
      audioHash: audioResult.ipfsHash,
      imageHash: imageResult.ipfsHash
    };
  } catch (error) {
    console.error('Error in uploadTrackToIPFS:', error);
    throw error;
  }
}

/**
 * Get a HTTP gateway URL for an IPFS hash
 */
export function getIpfsGatewayUrl(ipfsUrl: string): string {
  if (!ipfsUrl) return '';
  
  // Handle ipfs:// protocol
  if (ipfsUrl.startsWith('ipfs://')) {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
  
  // Handle direct hash
  if (ipfsUrl.match(/^[a-zA-Z0-9]{46}$/)) {
    return `https://gateway.pinata.cloud/ipfs/${ipfsUrl}`;
  }
  
  // Already a URL
  return ipfsUrl;
}

/**
 * Get metadata from IPFS
 * @param metadataUrl IPFS URL of the metadata
 * @returns Parsed metadata object
 */
export const getMetadataFromIPFS = async (metadataUrl: string): Promise<TrackMetadata> => {
  try {
    console.log('getMetadataFromIPFS called with URL:', metadataUrl);
    
    const gatewayUrl = getIpfsGatewayUrl(metadataUrl);
    console.log('Fetching metadata from gateway URL:', gatewayUrl);
    
    // Validate URL format before fetching
    try {
      new URL(gatewayUrl);
    } catch (urlError) {
      console.error('Invalid URL format:', urlError);
      console.error('Attempting to fix URL by adding https:// prefix');
      
      // Last resort fix - try adding https:// if it's missing
      const fixedUrl = gatewayUrl.startsWith('http') ? gatewayUrl : `https://${gatewayUrl}`;
      console.log('Fixed URL:', fixedUrl);
      
      // Test the fixed URL
      try {
        new URL(fixedUrl);
        // If we get here, the URL is valid now, so use it
        const response = await fetch(fixedUrl, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
          throw new Error(`Failed to fetch metadata: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Successfully fetched metadata with fixed URL');
        
        return enhanceMetadata(data);
      } catch (innerError) {
        console.error('Failed to fix URL:', innerError);
        throw new Error(`Invalid URL format: ${gatewayUrl}`);
      }
    }
    
    // Original URL looks valid, proceed with fetch ---
    const response = await fetch(gatewayUrl, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched metadata:', data);
    
    return enhanceMetadata(data);
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
};

// Helper function to ensure the metadata has all required fields
const enhanceMetadata = (data: any): TrackMetadata => {
  // Validate and ensure required fields
  const metadata: TrackMetadata = {
    name: data.name || 'Unknown Track',
    symbol: data.symbol || 'TRACK',
    description: data.description || '',
    genre: data.genre || 'Unknown',
    artist: data.artist || 'Unknown Artist',
    artistAddress: data.artistAddress || '0x0000000000000000000000000000000000000000',
    audio: data.audio || '',
    image: data.image || '',
    created_at: data.created_at || new Date().toISOString(),
    // Add required fields that might be missing
    attributes: data.attributes || [
      { trait_type: 'Genre', value: data.genre || 'Unknown' },
      { trait_type: 'Artist', value: data.artist || 'Unknown Artist' }
    ],
    properties: data.properties || {
      files: [
        {
          uri: data.audio || data.animation_url || '',
          type: 'audio/mp3'
        },
        {
          uri: data.image || '',
          type: 'image/png'
        }
      ],
      category: 'music',
      creators: data.artistAddress ? [
        {
          address: data.artistAddress,
          share: 100
        }
      ] : undefined
    },
    ...data
  };
  
  return metadata;
};

/**
 * Client-side function to fetch metadata from IPFS using our proxy API to avoid CORS issues
 * This should be used in client components to fetch metadata safely
 * 
 * @param ipfsUri IPFS URI (ipfs://CID or just CID)
 * @returns Parsed metadata object
 */
export const getMetadataFromIPFSProxy = async (ipfsUri: string): Promise<TrackMetadata> => {
  try {
    if (!ipfsUri) {
      throw new Error('Missing IPFS URI');
    }
    
    console.log('Getting metadata from IPFS proxy:', ipfsUri);
    
    // Use our server-side proxy API to avoid CORS issues
    const response = await fetch(`/api/ipfs-proxy?cid=${encodeURIComponent(ipfsUri)}`);
    
    if (!response.ok) {
      console.error(`Proxy API error: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch metadata via proxy: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Successfully fetched metadata via proxy');
    
    return enhanceMetadata(data);
  } catch (error) {
    console.error('Error fetching metadata from IPFS via proxy:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
};

// Initialize Pinata on module load
initializePinata();
