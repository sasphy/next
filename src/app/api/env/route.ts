import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Get all environment variables that start with NEXT_PUBLIC_
  const clientEnv: Record<string, string> = {};
  
  for (const key in process.env) {
    if (key.startsWith('NEXT_PUBLIC_')) {
      const shortKey = key.replace('NEXT_PUBLIC_', '');
      clientEnv[shortKey] = process.env[key] || '';
    }
  }
  
  // Add a few additional keys that might be useful
  clientEnv['IS_DEV'] = process.env.NODE_ENV === 'development' ? 'true' : 'false';
  clientEnv['API_URL'] = process.env.NEXT_PUBLIC_API_URL || '';
  clientEnv['FRONTEND_URL'] = process.env.NEXT_PUBLIC_FRONTEND_URL || '';
  clientEnv['STORAGE_URL'] = process.env.NEXT_PUBLIC_MINIO_URL || '';
  
  // Include all Solana-specific variables
  clientEnv['SOLANA_NETWORK'] = process.env.NEXT_PUBLIC_SOLANA_NETWORK || '';
  clientEnv['SOLANA_PROGRAM_ID'] = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID || '';
  clientEnv['SOLANA_ADMIN_WALLET'] = process.env.NEXT_PUBLIC_SOLANA_ADMIN_WALLET || '';
  clientEnv['SOLANA_TREASURY_ADDRESS'] = process.env.NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS || '';
  clientEnv['SOLANA_PROTOCOL_PDA'] = process.env.NEXT_PUBLIC_SOLANA_PROTOCOL_PDA || '';
  
  return NextResponse.json(clientEnv);
}
