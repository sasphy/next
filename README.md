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
