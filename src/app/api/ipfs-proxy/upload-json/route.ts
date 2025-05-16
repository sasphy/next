import { NextResponse } from 'next/server';

/**
 * API route for uploading JSON metadata to Pinata
 * Acts as a proxy to protect API keys
 */
export async function POST(request: Request) {
  try {
    // Get the metadata from the request
    const { metadata } = await request.json();
    
    if (!metadata) {
      return NextResponse.json(
        { error: 'No metadata provided' }, 
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
    
    // Add Pinata metadata for better organization
    const pinataMetadata = {
      name: metadata.name || 'sasphy-token-metadata',
      keyvalues: {
        app: 'sasphy-music',
        type: 'token-metadata',
        timestamp: new Date().toISOString(),
      }
    };
    
    // Configure options to optimize storage
    const pinataOptions = {
      cidVersion: 1,
    };
    
    // Prepare the data to be sent
    const pinataBody = {
      pinataContent: metadata,
      pinataMetadata,
      pinataOptions,
    };
    
    // Send to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataApiSecret,
      },
      body: JSON.stringify(pinataBody),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata JSON upload failed:', error);
      return NextResponse.json(
        { error: `Pinata JSON upload failed: ${error}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error handling JSON upload:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
      { status: 500 }
    );
  }
} 