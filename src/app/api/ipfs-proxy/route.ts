import { NextRequest, NextResponse } from 'next/server';
import env from '@/lib/env';
import { getIpfsGatewayUrl } from '@/lib/ipfs-storage';

/**
 * IPFS Proxy API Route
 * This route handles IPFS content fetching to avoid CORS issues when fetching
 * directly from the browser. It also adds authentication for private gateways if needed.
 */
export async function GET(req: NextRequest) {
  // Get CID from the request query
  const { searchParams } = new URL(req.url);
  const cid = searchParams.get('cid');
  
  // Check if CID is provided
  if (!cid) {
    return NextResponse.json(
      { error: 'Missing CID parameter' },
      { status: 400 }
    );
  }
  
  try {
    // Convert IPFS URL or CID to a gateway URL
    const gatewayUrl = getIpfsGatewayUrl(cid);
    
    // Fetch the content from the gateway
    const response = await fetch(gatewayUrl, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    // Check if the fetch was successful
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch from IPFS: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the content type and content
    const contentType = response.headers.get('content-type') || 'application/json';
    
    // Different handling based on content type
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } else if (contentType.includes('image/')) {
      // For images, forward as-is
      const blob = await response.blob();
      return new NextResponse(blob, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      });
    } else if (contentType.includes('audio/')) {
      // For audio, forward as-is
      const blob = await response.blob();
      return new NextResponse(blob, {
        headers: {
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        }
      });
    } else {
      // For other content types, forward as text
      const text = await response.text();
      return new NextResponse(text, {
        headers: {
          'Content-Type': contentType
        }
      });
    }
  } catch (error) {
    console.error('Error proxying IPFS content:', error);
    
    return NextResponse.json(
      { error: `Failed to proxy IPFS content: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 