import { NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

/**
 * API route for verifying Pinata IPFS credentials
 * Tests if the Pinata JWT is valid by making a simple API call
 */
export async function GET() {
  try {
    // Get Pinata JWT from environment - server-side only!
    const pinataJwt = process.env.PINATA_JWT;
    
    // Check if JWT exists
    if (!pinataJwt) {
      return NextResponse.json({
        success: false,
        message: 'Pinata JWT not found in environment variables.',
        help: 'Please add PINATA_JWT to your .env.local file.',
        env: {
          jwtExists: false
        }
      }, { status: 400 });
    }
    
    // Test Pinata JWT by making a direct API call
    try {
      // Initialize the Pinata SDK
      const pinata = new PinataSDK({
        pinataJwt
      });
      
      // Make a direct API call to test authentication
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${pinataJwt}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }
      
      const authData = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Pinata JWT is valid',
        details: authData
      });
      
    } catch (error: any) {
      console.error('Pinata authentication error:', error);
      
      return NextResponse.json({
        success: false,
        message: 'Pinata JWT is invalid or expired',
        error: error.message || 'Authentication error',
        help: 'Please check your PINATA_JWT value in .env.local',
        env: {
          jwtExists: true,
          isValid: false
        }
      }, { status: 401 });
    }
    
  } catch (error) {
    console.error('Error in verify credentials route:', error);
    
    return NextResponse.json({
      success: false,
      message: 'An error occurred while verifying Pinata JWT',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 