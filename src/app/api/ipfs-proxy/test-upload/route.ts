import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

/**
 * API route for testing Pinata uploads
 * Provides detailed feedback for troubleshooting
 */
export async function POST(request: Request) {
  try {
    console.log('IPFS Test Upload API called');
    
    // Log environment variables status (without exposing values)
    console.log('PINATA_JWT exists:', !!process.env.PINATA_JWT);
    console.log('NEXT_PUBLIC_GATEWAY_URL exists:', !!process.env.NEXT_PUBLIC_GATEWAY_URL);
    
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file provided in the request');
      return NextResponse.json(
        { 
          success: false, 
          message: 'No file provided', 
          help: 'Make sure to include a file field in the FormData.'
        }, 
        { status: 400 }
      );
    }
    
    // Log file details
    console.log(`File received: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
    
    // Get Pinata JWT from environment - server-side only!
    const pinataJwt = process.env.PINATA_JWT;
    
    if (!pinataJwt) {
      console.error('Pinata JWT not found');
      return NextResponse.json({
        success: false,
        message: 'Pinata JWT not configured',
        details: 'Add PINATA_JWT to your .env.local file.',
        help: 'Visit /api/ipfs-proxy/test-guide for more information.',
        environment: {
          jwtExists: false,
          gatewayExists: !!process.env.NEXT_PUBLIC_GATEWAY_URL
        }
      }, { status: 500 });
    }
    
    try {
      // Convert file to ArrayBuffer
      const fileArrayBuffer = await file.arrayBuffer();
      const fileBuffer = Buffer.from(fileArrayBuffer);
      
      // Create form data for direct API call
      const pinataFormData = new FormData();
      const blob = new Blob([fileBuffer], { type: file.type });
      pinataFormData.append('file', new File([blob], file.name, { type: file.type }));
      
      // Call Pinata API directly for reliable results
      const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${pinataJwt}`
        },
        body: pinataFormData
      });
      
      if (!pinataResponse.ok) {
        throw new Error(`Pinata API error: ${pinataResponse.status} ${pinataResponse.statusText}`);
      }
      
      const result = await pinataResponse.json();
      
      // Log success
      console.log('Test upload successful:', {
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize
      });
      
      // Format response to maintain API compatibility
      const responseData = {
        success: true,
        message: 'File successfully uploaded to IPFS using Pinata',
        details: {
          IpfsHash: result.IpfsHash,
          PinSize: result.PinSize,
          Timestamp: result.Timestamp
        },
        environment: {
          jwtExists: true,
          gatewayExists: !!process.env.NEXT_PUBLIC_GATEWAY_URL,
          gatewayUrl: process.env.NEXT_PUBLIC_GATEWAY_URL
        },
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      };
      
      return NextResponse.json(responseData);
      
    } catch (error: any) {
      console.error('Pinata upload error:', error);
      
      return NextResponse.json({
        success: false,
        message: 'Failed to upload file to Pinata',
        error: error.message || 'Unknown error occurred',
        environment: {
          jwtExists: true,
          gatewayExists: !!process.env.NEXT_PUBLIC_GATEWAY_URL
        },
        file: {
          name: file.name,
          size: file.size,
          type: file.type
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Unhandled error in test-upload route:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
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