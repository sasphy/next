import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

/**
 * API route for uploading files to Pinata IPFS
 * Acts as a proxy to protect API keys
 */
export async function POST(request: Request) {
  try {
    console.log('IPFS Upload API called');
    
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in the request');
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      );
    }
    
    console.log(`File received: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    
    // Get Pinata JWT from environment - server-side only!
    const pinataJwt = process.env.PINATA_JWT;
    
    if (!pinataJwt) {
      console.error('Pinata JWT not found');
      return NextResponse.json({
        success: false,
        message: 'Pinata JWT not configured',
        details: 'Add PINATA_JWT to your .env.local file.',
        help: 'Visit /api/ipfs-proxy/test-guide for more information.'
      }, { status: 500 });
    }
    
    // Initialize the Pinata SDK
    const pinata = new PinataSDK({ 
      pinataJwt
    });
    
    try {
      // Using plain fetch since there are SDK compatibility issues
      // Convert file to ArrayBuffer
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      
      // Create form data
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.type });
      formData.append('file', new File([blob], file.name, { type: file.type }));
      
      // Call Pinata API directly
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJwt}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('File uploaded successfully:', result);
      
      return NextResponse.json({
        success: true,
        IpfsHash: result.IpfsHash,
        PinSize: result.PinSize,
        Timestamp: result.Timestamp
      });
      
    } catch (pinataError: any) {
      console.error('Pinata upload error:', pinataError);
      return NextResponse.json({
        success: false,
        error: 'Failed to upload to IPFS', 
        details: pinataError.message
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error handling upload request:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Increase the body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}; 