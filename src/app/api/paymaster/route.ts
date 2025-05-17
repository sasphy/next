import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy for Paymaster service to avoid exposing API keys in frontend
 * This will forward requests to the actual Paymaster service
 */
export async function POST(request: NextRequest) {
  // Get the Paymaster service URL from environment variables
  const paymasterServiceUrl = process.env.PAYMASTER_SERVICE_URL;
  
  if (!paymasterServiceUrl) {
    return NextResponse.json(
      { error: 'Paymaster service URL not configured' },
      { status: 500 }
    );
  }

  try {
    // Parse the incoming request body
    const body = await request.json();
    
    // Forward the request to the actual Paymaster service
    const response = await fetch(paymasterServiceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // You could add authentication headers here if needed
      },
      body: JSON.stringify(body),
    });
    
    // Get the response from the Paymaster service
    const data = await response.json();
    
    // Forward the response back to the client
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error('Paymaster proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to forward request to Paymaster service' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking Paymaster status
 */
export async function GET() {
  const paymasterServiceUrl = process.env.PAYMASTER_SERVICE_URL;
  
  if (!paymasterServiceUrl) {
    return NextResponse.json(
      { status: 'error', message: 'Paymaster service URL not configured' },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    status: 'available',
    paymasterType: 'Coinbase Developer Platform',
  });
} 