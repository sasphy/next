'use client';

import { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Define types for window.ENV
declare global {
  interface Window {
    ENV?: {
      SOLANA_NETWORK?: string;
      SOLANA_RPC?: string;
      IS_DEV?: boolean;
      [key: string]: any;
    };
  }
}

interface CoinbaseSmartWalletProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
}

export const CoinbaseSmartWalletProvider: FC<CoinbaseSmartWalletProviderProps> = ({ 
  children,
  network = WalletAdapterNetwork.Devnet // Default to devnet
}) => {
  // State to keep track of mounting for hydration
  const [mounted, setMounted] = useState(false);
  const [chainId, setChainId] = useState<number>(8453); // Base mainnet by default

  // Initialize SDK only on client-side
  useEffect(() => {
    setMounted(true);
    
    // Determine chain ID based on network
    if (typeof window !== 'undefined') {
      // If window.ENV network is set, use that
      if (window.ENV?.SOLANA_NETWORK === 'Devnet') {
        setChainId(84532); // Base Sepolia (testnet)
      } else if (window.ENV?.SOLANA_NETWORK === 'Mainnet') {
        setChainId(8453); // Base Mainnet
      }
    }
  }, [network]);
  
  // Create the Coinbase SDK instance
  const sdk = useMemo(() => {
    if (typeof window === 'undefined') return null;
    
    return new CoinbaseWalletSDK({
      appName: 'Sasphy Music',
      appChainIds: [chainId],
      appLogoUrl: window.location.origin + '/assets/logos/sasphy_logo.svg', // Use absolute URL
    });
  }, [chainId]);
  
  // Create the Web3 provider
  const provider = useMemo(() => {
    if (!sdk) return null;
    
    // Create provider with Smart Wallet preference
    return sdk.makeWeb3Provider({
      options: 'smartWalletOnly',
    });
  }, [sdk]);

  // Return empty children during server-side rendering
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // Return empty children until client-side mounted to prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <div>
      {/* Provider will be used in a wrapper component that connects to it */}
      {children}
    </div>
  );
};

export default CoinbaseSmartWalletProvider; 