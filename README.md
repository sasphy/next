# SolBeat - Web3 Music Streaming Platform on Solana

SolBeat is a revolutionary music platform built on the Solana blockchain, designed to empower both artists and listeners through decentralized music ownership and discovery.

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

SolBeat uses the Metaplex NFT standard on Solana to implement multi-edition music tokens:

- **Master Edition NFT** - Created by the artist for each track
- **Print Editions** - Limited copies purchased by collectors
- **Royalty Management** - Built-in royalty distribution to artists

## Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
