import { NextResponse } from 'next/server';

// This API route is for development purposes only
// It provides a way to reload environment variables without restarting the server
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }

  // Only expose public environment variables (NEXT_PUBLIC_*)
  const publicEnvVars: Record<string, string> = {};
  
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('NEXT_PUBLIC_')) {
      publicEnvVars[key] = process.env[key] as string;
    }
  });

  return NextResponse.json(publicEnvVars);
} 