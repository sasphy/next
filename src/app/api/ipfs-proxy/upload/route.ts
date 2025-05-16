import { NextResponse } from 'next/server';
import env from '@/lib/env';

/**
 * API route for uploading files to Pinata
 * Acts as a proxy to protect API keys
 */
export async function POST(request: Request) {
  try {
    // Get the file from the request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' }, 
        { status: 400 }
      );
    }
    
    // Get Pinata credentials from environment variables
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataApiSecret = process.env.PINATA_API_SECRET;
    
    if (!pinataApiKey || !pinataApiSecret) {
      console.error('Pinata credentials not found in environment variables');
      return NextResponse.json(
        { error: 'Pinata configuration error' }, 
        { status: 500 }
      );
    }
    
    // Create a new FormData object for the Pinata API request
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Make the request to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataApiSecret,
      },
      body: pinataFormData,
    });
    
    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata upload error:', errorText);
      return NextResponse.json(
        { error: 'Failed to upload to Pinata' }, 
        { status: response.status }
      );
    }
    
    // Return the response from Pinata
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Increase the body size limit to handle larger file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
  },
}; 