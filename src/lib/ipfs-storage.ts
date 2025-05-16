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
 * Handle multiple file uploads for a track
 * @param audioFile Audio file
 * @param coverImageFile Cover image file
 * @param metadata Track metadata without audio/image URLs
 * @returns Object with IPFS URLs
 */
export const uploadTrackToIPFS = async (
  audioFile: File,
  coverImageFile: File,
  metadata: {
    name: string;
    symbol: string;
    description: string;
    genre: string;
    artist: string;
    artistAddress: string;
    created_at?: string;
    [key: string]: unknown;
  }
): Promise<{
  audioUrl: string;
  imageUrl: string;
  metadataUrl: string;
}> => {
  ensurePinataInitialized();
  
  try {
    console.log('Starting IPFS uploads...');
    
    // Upload audio and cover image in parallel
    const [audioUrl, imageUrl] = await Promise.all([
      uploadFileToIPFS(audioFile, `audio-${metadata.name}`),
      uploadFileToIPFS(coverImageFile, `cover-${metadata.name}`)
    ]);
    
    console.log('Files uploaded successfully:', { audioUrl, imageUrl });
    
    // Create the complete metadata with file URLs - ensure all required properties are present
    const completeMetadata: TrackMetadata = {
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      genre: metadata.genre,
      artist: metadata.artist,
      artistAddress: metadata.artistAddress,
      created_at: metadata.created_at || new Date().toISOString(),
      audio: audioUrl,
      image: imageUrl,
      // Type-safe way to copy additional properties
      ...(metadata.initialPrice ? { initialPrice: String(metadata.initialPrice) } : {}),
      ...(metadata.finalPrice ? { finalPrice: String(metadata.finalPrice) } : {}),
      ...(metadata.maxSupply ? { maxSupply: String(metadata.maxSupply) } : {}),
      ...(metadata.curveType ? { curveType: String(metadata.curveType) } : {})
    };
    
    // Upload the metadata
    const metadataUrl = await uploadMetadataToIPFS(completeMetadata);
    
    console.log('Track successfully uploaded to IPFS:', {
      audioUrl,
      imageUrl,
      metadataUrl
    });
    
    return {
      audioUrl,
      imageUrl,
      metadataUrl
    };
  } catch (error) {
    console.error('Error uploading track to IPFS:', error);
    throw new Error(`Failed to upload track to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gateway URLs for displaying IPFS content
 * @param ipfsUrl IPFS URL (ipfs://...)
 * @returns HTTP URL using a public gateway
 */
export const getIPFSGatewayUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  
  try {
    // Get the gateway URL and JWT from environment variables
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || env.gatewayUrl || 'https://indigo-leading-rabbit-443.mypinata.cloud/ipfs';
    const jwt = process.env.PINATA_JWT || env.pinataJwt;
    
    // Clean up the gateway URL
    const cleanGatewayUrl = gatewayUrl.replace(/\/+$/, '').replace(/\/ipfs$/, '');
    
    // Ensure the URL has a protocol (https:// or http://)
    const gatewayWithProtocol = cleanGatewayUrl.startsWith('http') 
      ? cleanGatewayUrl 
      : `https://${cleanGatewayUrl}`;
    
    const baseGatewayUrl = `${gatewayWithProtocol}/ipfs`;
    
    // Add authentication to all IPFS URLs
    const authParam = jwt ? `?pinataGatewayToken=${jwt}` : '';
    
    // Handle ipfs:// protocol
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.substring(7);
      return `${baseGatewayUrl}/${cid}${authParam}`;
    }
    
    // If it's already a HTTP URL, return as is
    if (ipfsUrl.startsWith('http')) {
      return ipfsUrl;
    }
    
    // Handle direct CID
    return `${baseGatewayUrl}/${ipfsUrl}${authParam}`;
  } catch (error) {
    console.error('Error formatting IPFS gateway URL:', error);
    // Fallback to a simpler approach - use public IPFS gateway
    try {
      // Default to a public gateway if custom one fails
      if (ipfsUrl.startsWith('ipfs://')) {
        return `https://ipfs.io/ipfs/${ipfsUrl.substring(7)}`;
      } else if (!ipfsUrl.startsWith('http')) {
        return `https://ipfs.io/ipfs/${ipfsUrl}`;
      }
      return ipfsUrl;
    } catch (fallbackError) {
      console.error('Even fallback URL formatting failed:', fallbackError);
      return ipfsUrl; // Return original URL in case of error
    }
  }
};

/**
 * Get metadata from IPFS
 * @param metadataUrl IPFS URL of the metadata
 * @returns Parsed metadata object
 */
export const getMetadataFromIPFS = async (metadataUrl: string): Promise<TrackMetadata> => {
  try {
    console.log('getMetadataFromIPFS called with URL:', metadataUrl);
    
    const gatewayUrl = getIPFSGatewayUrl(metadataUrl);
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
