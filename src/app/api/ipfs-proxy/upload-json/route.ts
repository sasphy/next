import { NextResponse } from 'next/server';
import env from '@/lib/env';

/**
 * API route for uploading JSON to Pinata IPFS
 * Acts as a proxy to protect API keys
 */
export async function POST(request: Request) {
  try {
    // Get the JSON from the request
    const { metadata } = await request.json();
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'No metadata provided' }, 
        { status: 400 }
      );
    }
    
    // Get Pinata JWT from environment - server-side only!
    const pinataJwt = process.env.PINATA_JWT;
    
    // Verify credentials
    if (!pinataJwt) {
      console.error('Pinata JWT not found');
      return NextResponse.json(
        { error: 'Pinata configuration error - JWT not found. Add PINATA_JWT to your .env.local file.' },
        { status: 500 }
      );
    }
    
    try {
      // Upload JSON to Pinata IPFS with direct API call
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${pinataJwt}`
        },
        body: JSON.stringify(metadata)
      });
      
      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
      }
      
      // Get the response data
      const result = await response.json();
      
      // Format the response to match the expected format
      const responseData = {
        IpfsHash: result.IpfsHash,
        PinSize: result.PinSize,
        Timestamp: result.Timestamp
      };
      
      return NextResponse.json(responseData);
      
    } catch (error: any) {
      console.error('Error uploading JSON to Pinata:', error);
      
      // Return specific error messages
      if (error.message?.includes('authentication')) {
        return NextResponse.json(
          { error: 'Pinata authentication failed - Invalid JWT' },
          { status: 401 }
        );
      } else {
        return NextResponse.json(
          { 
            error: 'Failed to upload JSON to Pinata',
            details: error.message || 'Unknown error'
          },
          { status: 500 }
        );
      }
    }
    
  } catch (error) {
    console.error('Unhandled error in upload-json route:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 