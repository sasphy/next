# Sasphy - Web3 Music Streaming Platform on Solana

Sasphy is a revolutionary music platform built on the Solana blockchain, designed to empower both artists and listeners through decentralized music ownership and discovery.

## Features

- **NFT Music Ownership** - Buy and collect music as NFTs using Solana blockchain
- **Early Vibe (EV) Rating System** - Get rewarded for discovering tracks before they become popular
- **AI Radio Host** - Enjoy personalized introductions to new music with our AI DJ
- **Multi-Edition Tokens** - Implemented using Metaplex Print Editions
- **Direct Artist Support** - Artists receive royalties directly through the blockchain
- **Social Influence** - Build your reputation as a music curator

## Technology Stack

- **Frontend**: Next.js 15.3.1 + React 19.1 + Tailwind v4
- **UI Components**: shadcn/UI
- **Blockchain**: Solana + Metaplex
- **Backend**: Elysia (Bun) API
- **Storage**: AWS S3 for music files
- **Real-time Data**: Redis for caching and scoring

## Environment Setup

To run this application properly, you need to configure some environment variables. Create a `.env.local` file in the project root with the following content:

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AUTH=true
NEXT_PUBLIC_ENABLE_PURCHASE=true

# Environment
NODE_ENV=development

# Solana Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_PROGRAM_ID=A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK
NEXT_PUBLIC_SOLANA_ADMIN_WALLET=7vCWanYCd848kSEqEbZUuamhgFhnKqDh4b2TC1fVEGg9
NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS=FXHUWiWF2QcjnZ9qCkxrzKpjuwzgr3e8acCPV4sKPRSV
NEXT_PUBLIC_SOLANA_PROTOCOL_PDA=4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM

# RPC URLs
RPC_URL_SOLANA_DEVNET=https://api.devnet.solana.com
RPC_URL_SOLANA_MAINNET=https://api.mainnet-beta.solana.com

# Convex (Database)
NEXT_PUBLIC_CONVEX_URL=your-convex-url-here

# IPFS/Pinata Configuration - REQUIRED
PINATA_API_KEY=your-pinata-api-key
PINATA_API_SECRET=your-pinata-api-secret
PINATA_JWT=your-pinata-jwt
NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

## Environment Variables

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
NEXT_PUBLIC_CLOUDINARY_PRESET=<your_cloudinary_preset>
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_SOLANA_PROGRAM_ID=A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK
NEXT_PUBLIC_SOLANA_ADMIN_WALLET=7vCWanYCd848kSEqEbZUuamhgFhnKqDh4b2TC1fVEGg9
NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS=FXHUWiWF2QcjnZ9qCkxrzKpjuwzgr3e8acCPV4sKPRSV
```

### Setting up Pinata Credentials

1. Create an account at [Pinata](https://app.pinata.cloud/register)
2. Go to your dashboard and generate an API key
3. Make sure to give it upload permissions
4. Copy the API Key, API Secret, and JWT
5. Paste them into your `.env.local` file

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up your environment variables in `.env.local`:
   ```
   # Example values (replace with your own)
   SOLANA_RPC_URL=https://api.devnet.solana.com
   ```
4. Start the development server:
   ```bash
   bun run dev
   ```

## Smart Contract Architecture

Sasphy uses the Metaplex NFT standard on Solana to implement multi-edition music tokens:

- **Master Edition NFT** - Created by the artist for each track
- **Print Editions** - Limited copies purchased by collectors
- **Royalty Management** - Built-in royalty distribution to artists

## Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## New Feature: Audio Spectrum Visualization

We've added an advanced audio spectrum visualization component that provides real-time frequency analysis of the playing audio tracks. This enhances the user experience with visual feedback.

### AudioSpectrum Component

The `AudioSpectrum` component (`src/components/ui/audio-spectrum.tsx`) uses the Web Audio API to create a real-time frequency analyzer. Key features:

- Real-time FFT (Fast Fourier Transform) analysis
- Customizable bar count, colors, and height
- Responsive design that works across devices
- Smooth animations for a polished look

### Implementation Details

The component:
1. Creates an `AnalyserNode` connected to the audio element
2. Uses `requestAnimationFrame` for efficient rendering
3. Samples frequency data using `getByteFrequencyData()`
4. Renders the visualization on HTML5 Canvas

### Usage Example

```tsx
import React, { useRef, useState } from 'react';
import AudioSpectrum from '@/components/ui/audio-spectrum';

function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  return (
    <div>
      <audio 
        ref={audioRef}
        src="/path/to/audio.mp3"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      <AudioSpectrum
        audioRef={audioRef}
        isPlaying={isPlaying}
        barCount={70}
        barColor="var(--color-primary)"
        height={60}
      />
      
      <button onClick={() => audioRef.current?.play()}>Play</button>
      <button onClick={() => audioRef.current?.pause()}>Pause</button>
    </div>
  );
}
```

### Library Page Demo

A new Library page (`src/app/library/page.tsx`) showcases the AudioSpectrum component with sample tracks. It features:

- A tabbed interface for tracks and visualizer
- Sample track selection
- Real-time spectrum visualization
- Responsive design

## Future Improvements

- Additional visualization types (waveform, particles)
- User-customizable visualization settings
- Reactive visualizations tied to music mood/genre
- Audio effects processing (EQ, reverb, etc.)
