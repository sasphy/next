import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { width: string, height: string } }) {
  // Create a simple SVG with the specified dimensions
  const width = params.width || '500';
  const height = params.height || '500';
  
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" 
         xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#9345F2" />
      <circle cx="${parseInt(width)/2}" cy="${parseInt(height)/2}" r="${Math.min(parseInt(width), parseInt(height))/4}" fill="#F2B807" />
      <text x="50%" y="50%" font-family="Arial" font-size="20" fill="white" 
            text-anchor="middle" dominant-baseline="middle">
        Music Track
      </text>
    </svg>
  `;
  
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
