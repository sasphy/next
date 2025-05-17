# Sasphy - Web3 Music Platform on Solana

Sasphy is a decentralized music platform built on the Solana blockchain that empowers both artists and listeners through tokenized music ownership. The platform leverages bonding curve mechanics to create a unique token economy where early supporters benefit from price appreciation.

Designed and built by Oslo.

## Core Features

- **Music Token Factory** - Deployed Solana program for creating music tokens with bonding curves
- **Smart Wallet Integration** - Coinbase Smart Wallet support with gas-free transactions via paymaster  
- **Multi-Edition NFTs** - Using Metaplex for master and print editions of music tokens
- **Bonding Curve Economics** - Four curve types (Linear, Exponential, Logarithmic, Sigmoid)
- **Artist Royalties** - Direct crypto payments to creators on every token purchase
- **Token Dashboard** - Visualizations showing token performance and market data
- **Audio Playback** - High-quality music streaming with spectrum visualization
- **IPFS Integration** - Decentralized storage for music and metadata via Pinata

## Technology Stack

- **Frontend**: Next.js 15.3.1 with React 19.1 and Tailwind v4
- **UI**: ShadCN component library with Radix UI primitives
- **Blockchain**: Solana (Program deployed on Devnet)
- **Smart Contracts**: Anchor framework with Rust
- **Wallet Adapters**: Solana Wallet Adapter + Coinbase SDK
- **Storage**: IPFS via Pinata gateway
- **APIs**: Elysia (Bun) for server endpoints
- **Database**: Convex for token deployments

## Repository Structure

The project consists of two main repositories:

### 1. Next-Solana (Frontend)

```
/next-solana
├── src/
│   ├── app/               # Next.js 15 app router
│   │   ├── components/        # React components 
│   │   │   ├── ui/            # ShadCN UI components
│   │   │   ├── wallet/        # Wallet integration components
│   │   │   └── providers/     # Context providers
│   │   ├── hooks/             # React hooks
│   │   │   ├── use-wallet-auth.ts
│   │   │   └── use-coinbase-smart-wallet.ts
│   │   ├── lib/               # Utility libraries
│   │   │   └── TokenFactoryClient.ts
│   │   └── types/             # TypeScript definitions
│   ├── public/
│   │   └── assets/            # Static assets
│   └── package.json           # Dependencies and scripts
```

### 2. Blockchain-Solana (Smart Contracts)

```
/blockchain-solana
├── programs/
│   └── music-token-factory/  # Solana program (Rust)
│       ├── src/
│       │   └── lib.rs        # Main contract code
│       └── Cargo.toml        # Rust dependencies
├── src/                      # TypeScript client
│   └── solbeat-token-client.ts
├── deployment/               # Deployment artifacts
├── scripts/                  # Deployment scripts
└── Anchor.toml               # Anchor configuration
```

## Deployed Contracts

| Contract | Address | Network |
|----------|---------|---------|
| Token Factory | `A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK` | Solana Devnet |
| Protocol PDA | `4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM` | Solana Devnet |
| Treasury | `FXHUWiWF2QcjnZ9qCkxrzKpjuwzgr3e8acCPV4sKPRSV` | Solana Devnet |
| Admin | `7vCWanYCd848kSEqEbZUuamhgFhnKqDh4b2TC1fVEGg9` | Solana Devnet |

## Smart Contract Architecture

The music token factory implements several key functions:

1. **initialize_protocol** - Sets platform fee and treasury address
2. **create_music_token** - Creates new music token with bonding curve parameters
3. **buy_tokens** - Purchases tokens with SOL based on the bonding curve
4. **sell_tokens** - Sells tokens back to the protocol
5. **update_token_metadata** - Updates token information
6. **update_protocol** - Modifies platform parameters

### Bonding Curve Implementation

The contract supports four types of bonding curves:

```rust
pub enum BondingCurveType {
    Linear,
    Exponential,
    Logarithmic,
    Sigmoid
}
```

Each curve type implements a different price function:

- **Linear**: `Price = initial_price + (supply * delta)`
- **Exponential**: `Price = initial_price * (1 + (supply² * delta / 10000))`
- **Logarithmic**: `Price = initial_price * (1 + delta/10000 * ln(1 + supply))`
- **Sigmoid**: `Price = initial_price * (1 + delta/5000 * (supply - 1000)/(1 + abs(supply - 1000)))`

## Frontend Integration

The frontend uses a `TokenFactoryClient` to interact with the Solana program. Key functionality includes:

- **Wallet Connection** - Support for multiple wallet providers
- **Token Creation** - Form with parameters for creating new tokens
- **Token Purchase** - UI for buying and selling tokens
- **Token Detail Pages** - Displays token information and market data
- **Creator Dashboard** - Analytics for token creators

### Wallet Support

The application supports multiple wallet types:

1. **Solana Native Wallets** - Phantom, Solflare, etc.
2. **Coinbase Smart Wallet** - With paymaster integration for gas-free transactions
3. **Wallet Connect** - For broader wallet support

## Coinbase Smart Wallet Integration

A key feature is the integration with Coinbase Smart Wallet, including paymaster support:

```typescript
// From src/hooks/use-coinbase-smart-wallet.ts
const sendTransaction = useCallback(async (to: string, value: string, data: string = '0x') => {
  // ...
  // If paymaster service is supported, include it
  if (capabilities && capabilities[chainId]?.paymasterService?.supported) {
    txOptions = {
      capabilities: {
        paymasterService: {
          url: process.env.NEXT_PUBLIC_PAYMASTER_URL || '/api/paymaster'
        }
      }
    };
  }
  // ...
});
```

## Environment Setup

Create a `.env.local` file with these variables:

```
# RPC Configuration
NEXT_PUBLIC_RPC_URL_SOLANA_DEVNET=https://api.devnet.solana.com
NEXT_PUBLIC_RPC_URL_SOLANA_MAINNET=https://api.mainnet-beta.solana.com

# Blockchain Settings
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_PROGRAM_ID=A3hPb35qCY6eqdcgqSGKWKCUDKnE9uUrXPowyaRGguZK
NEXT_PUBLIC_SOLANA_ADMIN_WALLET=7vCWanYCd848kSEqEbZUuamhgFhnKqDh4b2TC1fVEGg9
NEXT_PUBLIC_SOLANA_TREASURY_ADDRESS=FXHUWiWF2QcjnZ9qCkxrzKpjuwzgr3e8acCPV4sKPRSV
NEXT_PUBLIC_SOLANA_PROTOCOL_PDA=4VGsLuKatfBkEm8bSH6uKnWagXBx9QfxeGxuih6oN2sM

# IPFS/Pinata
PINATA_API_KEY=your-pinata-api-key
PINATA_API_SECRET=your-pinata-api-secret
PINATA_JWT=your-pinata-jwt
NEXT_PUBLIC_GATEWAY_URL=https://gateway.pinata.cloud/ipfs

# Paymaster Service (for gas-free transactions)
NEXT_PUBLIC_PAYMASTER_URL=/api/paymaster
PAYMASTER_SERVICE_URL=https://paymaster.coinbase.com/api
```

## Development Workflow

### Setup and Installation

```bash
# Clone repositories
git clone https://github.com/your-org/music-streaming-web3.git
cd music-streaming-web3

# Install dependencies for frontend
cd next-solana
bun install

# Install dependencies for blockchain
cd ../blockchain-solana
bun install
```

### Running Development Server

```bash
# Start the frontend
cd next-solana
bun run dev

# The app will be available at http://localhost:3088
```

### Building for Production

```bash
# Build the frontend
cd next-solana
bun run build
```

## Deployment Modes

The platform supports two modes:

1. **Simulation Mode**: For development without real blockchain transactions
2. **Live Mode**: Real interactions with Solana blockchain

### Creating a Music Token

To create a new music token using the Solana program:

```typescript
const tokenFactory = new TokenFactoryClient(connection, wallet);
await tokenFactory.createMusicToken(
  "Song Name",
  "SYMB",
  "ipfs://metadata-uri",
  0.1, // initial price in SOL
  0.01, // price increment in SOL
  BondingCurveType.Linear,
  5 // artist fee percentage
);
```

### Buying Music Tokens

```typescript
await tokenFactory.buyTokens(
  new PublicKey("token-mint-address"),
  1 // amount to buy
);
```

## Music Token Lifecycle

1. **Artist Creates Token**: Sets parameters and uploads music/metadata to IPFS
2. **Token Listed**: Available for purchase on the platform
3. **Fans Purchase**: Tokens follow bonding curve pricing
4. **Price Appreciation**: Early supporters benefit from price growth
5. **Resale Market**: Holders can sell tokens back to the protocol

## Metadata Structure

Each music token contains metadata in the following format:

```json
{
  "name": "Song Title",
  "symbol": "SYMB",
  "description": "Song description",
  "image": "ipfs://cover-art-hash",
  "animation_url": "ipfs://audio-file-hash",
  "attributes": [
    { "trait_type": "Genre", "value": "Electronic" },
    { "trait_type": "Duration", "value": "3:45" },
    { "trait_type": "Artist", "value": "Artist Name" }
  ],
  "properties": {
    "files": [
      { "uri": "ipfs://audio-file-hash", "type": "audio/mp3" }
    ]
  }
}
```
