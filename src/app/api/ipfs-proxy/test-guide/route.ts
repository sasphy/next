import { NextResponse } from 'next/server';

/**
 * API route that provides a guide for testing IPFS uploads
 */
export async function GET() {
  const guide = `
# IPFS Upload Testing Guide

This guide will help you troubleshoot and test your IPFS uploads via Pinata.

## 1. Verify Environment Variables

First, check if your Pinata JWT is properly configured by making a GET request to:

\`\`\`
curl http://localhost:3088/api/ipfs-proxy/verify-credentials
\`\`\`

This will show you if your JWT token is valid.

## 2. Test File Upload with Curl

You can test uploading a file using:

\`\`\`
curl -X POST http://localhost:3088/api/ipfs-proxy/test-upload -F "file=@/path/to/your/file.jpg"
\`\`\`

Example with test file:

\`\`\`
curl -X POST http://localhost:3088/api/ipfs-proxy/test-upload -F "file=@/Users/pc/apps/MPC/music-streaming/music-streaming-web3/next-solana/public/testing/Onchain.jpg"
\`\`\`

## 3. Common Issues

- **500 Internal Server Error**: Usually means Pinata JWT is missing or invalid
- **413 Payload Too Large**: File size exceeds limits
- **400 Bad Request**: Malformed request or invalid parameters

## 4. Setup Instructions

1. Create a \`.env.local\` file in your project root directory
2. Add these environment variables:
   \`\`\`
   PINATA_JWT=your-pinata-jwt-token
   NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud
   \`\`\`
3. Restart your development server
4. Try the tests again

## 5. Getting a Pinata JWT

1. Create an account at https://app.pinata.cloud/
2. Go to API Keys in the dashboard
3. Create a new API key with the necessary permissions
4. Copy the JWT token (not the API key/secret)
5. Add it to your .env.local file as PINATA_JWT (not as a NEXT_PUBLIC variable!)

## 6. Security Note

IMPORTANT: Never use NEXT_PUBLIC_ prefix for JWT tokens or API keys!
- NEXT_PUBLIC_ variables are exposed to the browser
- JWT tokens should be kept secure on the server side
- Only use the PINATA_JWT variable name for your token

## 7. Direct Integration Testing

If you want to test the direct integration in your app, use the browser console:

\`\`\`javascript
// Create a simple test file
const testFile = new File(['Hello, world!'], 'test.txt', { type: 'text/plain' });

// Upload using your existing function
fetch('/api/ipfs-proxy/upload', {
  method: 'POST',
  body: (() => {
    const formData = new FormData();
    formData.append('file', testFile);
    return formData;
  })()
})
.then(response => response.json())
.then(data => console.log('Upload result:', data))
.catch(error => console.error('Upload error:', error));
\`\`\`
`;

  return new NextResponse(guide, {
    headers: {
      'Content-Type': 'text/markdown',
    },
  });
} 