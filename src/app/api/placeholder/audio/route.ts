import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Return a redirect to a free music sample from a CDN
    return NextResponse.redirect('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3');
  } catch (error) {
    console.error('Error serving placeholder audio:', error);
    return new NextResponse('Error serving placeholder audio', { status: 500 });
  }
}
