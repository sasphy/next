import { PinataSDK } from 'pinata';
import env from '@/lib/env';

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
  [key: string]: unknown;
}

// Initialize Pinata client
let pinata: PinataSDK | null = null;

/**
 * Initialize the Pinata client
 */
export const initializePinata = () => {
  try {
    // Get Pinata JWT from environment
    const pinataJwt = process.env.PINATA_JWT || env.pinataJwt;
    
    // Get gateway URL and format it properly
    let pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL || env.gatewayUrl;
    if (pinataGateway) {
      // Remove trailing slashes
      pinataGateway = pinataGateway.replace(/\/+$/, '');
      // Remove /ipfs suffix if present
      pinataGateway = pinataGateway.replace(/\/ipfs$/, '');
    }
    
    // Check if JWT is available
    if (!pinataJwt) {
      console.error('Missing Pinata API credentials - JWT not found');
      return;
    }
    
    // Initialize Pinata SDK with the correct configuration format
    pinata = new PinataSDK({ 
      pinataJwt,
      pinataGateway
    });
    
    console.log('Pinata initialized with JWT successfully');
    if (pinataGateway) {
      console.log('Using gateway:', pinataGateway);
    } else {
      console.log('No gateway specified, using Pinata default gateway');
    }
  } catch (error) {
    console.error('Failed to initialize Pinata client with JWT:', error);
    pinata = null;
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
 * @param file File to upload
 * @param name Optional name for the file
 * @returns IPFS URL of the uploaded file
 */
export const uploadFileToIPFS = async (file: File | Blob, name: string): Promise<string> => {
  const pinataClient = ensurePinataInitialized();
  
  try {
    // Use the correct method for the new SDK
    const result = await pinataClient.upload.public.file(file as File, {
      metadata: {
        name: name || `file-${Date.now()}`
      }
    });
    
    console.log('File uploaded to IPFS:', result.cid);
    
    // Return the IPFS URL
    return `ipfs://${result.cid}`;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Upload track metadata to IPFS
 * @param metadata Track metadata object
 * @returns IPFS URL of the uploaded metadata
 */
export const uploadMetadataToIPFS = async (metadata: TrackMetadata): Promise<string> => {
  const pinataClient = ensurePinataInitialized();
  
  try {
    // Upload to Pinata using JSON with the correct method for the new SDK
    const result = await pinataClient.upload.public.json(metadata, {
      metadata: {
        name: `metadata-${metadata.name}-${Date.now()}`
      }
    });
    
    console.log('Metadata uploaded to IPFS:', result.cid);
    
    // Return the IPFS URL
    return `ipfs://${result.cid}`;
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error);
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Helper to construct a track metadata object
 */
export const createTrackMetadata = (
  name: string,
  symbol: string,
  description: string,
  genre: string,
  artist: string,
  artistAddress: string,
  audioUrl: string,
  imageUrl: string,
  additionalProperties: Record<string, unknown> = {}
): TrackMetadata => {
  return {
    name,
    symbol,
    description,
    genre,
    artist,
    artistAddress,
    audio: audioUrl,
    image: imageUrl,
    created_at: new Date().toISOString(),
    ...additionalProperties
  };
};

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
  initialPrice: string;
  curveType: string;
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

/**
 * Upload a track and its metadata to IPFS using Pinata
 */
export async function uploadTrackToIPFS(
  audioFile: File, 
  imageFile: File, 
  metadata: MetadataObject
): Promise<IPFSResult> {
  // First upload the audio and image files
  const formData = new FormData();
  formData.append('file', audioFile);
  
  const audioRes = await fetch('/api/ipfs-proxy/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!audioRes.ok) {
    const error = await audioRes.text();
    throw new Error(`Failed to upload audio: ${error}`);
  }
  
  const audioData = await audioRes.json();
  const audioIpfsHash = audioData.IpfsHash;
  const audioUrl = `ipfs://${audioIpfsHash}`;
  
  // Upload image
  const imageFormData = new FormData();
  imageFormData.append('file', imageFile);
  
  const imageRes = await fetch('/api/ipfs-proxy/upload', {
    method: 'POST',
    body: imageFormData,
  });
  
  if (!imageRes.ok) {
    const error = await imageRes.text();
    throw new Error(`Failed to upload image: ${error}`);
  }
  
  const imageData = await imageRes.json();
  const imageIpfsHash = imageData.IpfsHash;
  const imageUrl = `ipfs://${imageIpfsHash}`;
  
  // Create and upload metadata
  const metadataObject: MetadataObject = {
    ...metadata,
    image: imageUrl,
    animation_url: audioUrl,
  };
  
  const metadataRes = await fetch('/api/ipfs-proxy/upload-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ metadata: metadataObject }),
  });
  
  if (!metadataRes.ok) {
    const error = await metadataRes.text();
    throw new Error(`Failed to upload metadata: ${error}`);
  }
  
  const metadataData = await metadataRes.json();
  const metadataIpfsHash = metadataData.IpfsHash;
  const metadataUrl = `ipfs://${metadataIpfsHash}`;
  
  return {
    metadataUrl,
    audioUrl,
    imageUrl,
    metadataHash: metadataIpfsHash,
    audioHash: audioIpfsHash,
    imageHash: imageIpfsHash,
  };
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
        
        return data as TrackMetadata;
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
      ...data
    };
    
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
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
      ...data
    };
    
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from IPFS via proxy:', error);
    throw new Error('Failed to fetch metadata from IPFS');
  }
};

// Initialize Pinata on module load
initializePinata();
