'use client';

import { useState } from 'react';
import { initializePinata, uploadTrackToIPFS, getMetadataFromIPFS } from '@/lib/ipfs-storage';
import type { TrackMetadata } from '@/lib/types';

interface TokenizedTrackInput {
  name: string;
  symbol: string;
  description: string;
  genre: string;
  artist: string;
  artistAddress: string;
  audioFile: File;
  coverImageFile: File;
  initialPrice?: string;
  finalPrice?: string;
  maxSupply?: string;
  curveType?: string;
}

interface UploadResult {
  audioUrl: string;
  imageUrl: string;
  metadataUrl: string;
}

/**
 * Hook for handling IPFS interactions for tokenized tracks
 */
export function useIPFSTrack() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  /**
   * Upload a track with metadata to IPFS
   */
  const uploadTrack = async (trackData: TokenizedTrackInput): Promise<UploadResult> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    
    try {
      // Initialize Pinata if not already initialized
      initializePinata();
      
      // Set upload started
      setUploadProgress(10);
      
      // Extract files and metadata
      const { 
        audioFile, 
        coverImageFile, 
        name,
        symbol,
        description,
        genre,
        artist,
        artistAddress,
        initialPrice,
        finalPrice,
        maxSupply,
        curveType
      } = trackData;
      
      // Prepare metadata object
      const metadata = {
        name,
        symbol,
        description,
        genre,
        artist,
        artistAddress,
        initialPrice,
        finalPrice,
        maxSupply,
        curveType,
        delta: "0.1", // Added the missing delta field
        created_at: new Date().toISOString()
      };
      
      setUploadProgress(20);
      
      // Upload to IPFS
      const result = await uploadTrackToIPFS(audioFile, coverImageFile, metadata);
      
      // Set result
      setUploadResult(result);
      setUploadProgress(100);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error uploading to IPFS';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Get track metadata from IPFS
   */
  const getTrackMetadata = async (metadataUrl: string): Promise<TrackMetadata> => {
    try {
      const ipfsMetadata = await getMetadataFromIPFS(metadataUrl);
      
      // Transform data from IPFS metadata format to TrackMetadata format
      const trackMetadata: TrackMetadata = {
        name: ipfsMetadata.name,
        description: ipfsMetadata.description,
        image: ipfsMetadata.image || '',
        animation_url: ipfsMetadata.audio || '',
        external_url: '',
        artist: ipfsMetadata.artist,
        attributes: ipfsMetadata.attributes || [],
        properties: ipfsMetadata.properties || {
          files: [],
          category: 'audio'
        }
      };
      
      return trackMetadata;
    } catch (error) {
      setUploadError(`Error fetching metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  return {
    uploadTrack,
    getTrackMetadata,
    isUploading,
    uploadProgress,
    uploadError,
    uploadResult
  };
}

export default useIPFSTrack; 