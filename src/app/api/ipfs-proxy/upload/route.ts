import { NextResponse } from 'next/server';

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
    
    // Setup the FormData for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Add options for better organization
    const metadata = {
      name: file.name,
      keyvalues: {
        app: 'sasphy-music',
        timestamp: new Date().toISOString(),
      }
    };
    
    pinataFormData.append('pinataMetadata', JSON.stringify(metadata));
    
    // Configure options to optimize storage
    const options = {
      cidVersion: 1,
    };
    
    pinataFormData.append('pinataOptions', JSON.stringify(options));
    
    // Send to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': pinataApiKey,
        'pinata_secret_api_key': pinataApiSecret,
      },
      body: pinataFormData,
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Pinata upload failed:', error);
      return NextResponse.json(
        { error: `Pinata upload failed: ${error}` }, 
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    return NextResponse.json(
      { error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` }, 
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