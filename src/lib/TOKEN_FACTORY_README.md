# SolBeat Token Factory Integration

This package provides integration with the SolBeat Token Factory, which allows for creating and purchasing music NFTs with bonding curve pricing.

## Overview

The token factory implements:

1. Music token creation with multiple bonding curve types
2. Token purchasing with dynamic pricing
3. Artist royalties and platform fees
4. Social influence tracking

## Usage

### Setup

First, import the token factory client creator:

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import createTokenFactoryClient from '@/lib/createTokenFactoryClient';
import { BondingCurveType } from '@/lib/idls';

// In your component
const { publicKey, signTransaction, signAllTransactions } = useWallet();
const connection = new Connection('https://api.devnet.solana.com');

// Create a wallet adapter
const walletAdapter = {
  publicKey,
  signTransaction,
  signAllTransactions
};

// Create the token factory client
const tokenFactory = createTokenFactoryClient(connection, walletAdapter);
```

### Creating a Music Token

To create a new music token:

```typescript
const createToken = async () => {
  try {
    const tx = await tokenFactory.createMusicToken(
      "My Awesome Track",  // name
      "TRACK",             // symbol
      "https://arweave.net/metadata-uri", // metadata URI
      0.01,                // initial price (0.01 SOL)
      0.001,               // price increment (0.001 SOL)
      BondingCurveType.Linear, // pricing curve
      5                    // artist fee (5%)
    );
    
    console.log("Token created! Transaction:", tx);
  } catch (error) {
    console.error("Error creating token:", error);
  }
}
```

### Buying Tokens

To purchase tokens:

```typescript
const buyToken = async (mintAddress: string, amount: number = 1) => {
  try {
    const mint = new PublicKey(mintAddress);
    const tx = await tokenFactory.buyTokens(mint, amount);
    
    console.log(`Purchased ${amount} token(s)! Transaction:`, tx);
  } catch (error) {
    console.error("Error buying token:", error);
  }
}
```

### Getting Track Information

To fetch details about a track:

```typescript
const getTrackInfo = async (mintAddress: string) => {
  try {
    const mint = new PublicKey(mintAddress);
    // For the mock client
    if ('getTrack' in tokenFactory) {
      const track = await tokenFactory.getTrack(mint);
      console.log("Track details:", track);
      return track;
    }
    
    // For the real client
    // Fetch track data from the blockchain
    const [tokenFactoryPDA] = await tokenFactory.findTokenFactoryPDA(mint);
    // Fetch account info and parse it
    // This will need to be implemented in the real client
  } catch (error) {
    console.error("Error getting track info:", error);
  }
}
```

## Bonding Curve Types

The token factory supports four types of bonding curves:

1. **Linear** - Price increases linearly with supply
2. **Exponential** - Price increases exponentially with supply
3. **Logarithmic** - Price increases quickly at first, then slows
4. **Sigmoid** - S-curve pricing with slow start, quick middle growth, then plateau

## Mock Implementation

For development and testing, a mock implementation is provided. To use it:

1. Set `NEXT_PUBLIC_USE_MOCK_TOKEN_FACTORY=true` in your `.env.local` file
2. Or set `window.ENV.USE_MOCK_TOKEN_FACTORY = 'true'` in your code

The mock implementation simulates all the functionality of the real token factory but doesn't require actual Solana transactions or SOL.

## Current Status

The token factory integration is currently in development:

- ✅ Mock implementation for testing frontend integration
- ✅ Basic client for interacting with deployed contract
- ⏳ Actual contract deployment to Solana devnet (pending)

If you run into issues with the real contract, use the mock implementation until the contract is fully deployed and tested.

## Troubleshooting

Common issues:

1. **"Program doesn't exist" error** - The program may not be deployed yet. Use the mock implementation.
2. **Insufficient SOL** - Ensure your wallet has enough SOL for transactions.
3. **Transaction rejected** - User may have declined to sign the transaction.
4. **No wallet found** - Ensure the user has connected their wallet before interaction.

## Next Steps

- Complete the real contract deployment
- Implement additional features like token selling
- Add analytics and social tracking
- Deploy to Solana mainnet-beta