import { NextResponse } from 'next/server';
import env from '@/lib/env';

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
    
    // Make the request to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataApiSecret,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: metadata.name || 'sasphy-metadata',
        },
      }),
    });
    
    // Check for errors
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pinata JSON upload error:', errorText);
      return NextResponse.json(
        { error: 'Failed to upload JSON to Pinata' }, 
        { status: response.status }
      );
    }
    
    // Return the response from Pinata
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in upload-json route:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 