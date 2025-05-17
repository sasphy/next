'use client';

import { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { 
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ 
  children,
  network = WalletAdapterNetwork.Devnet // Default to devnet
}) => {
  // Mounted state to handle client-side initialization
  const [mounted, setMounted] = useState(false);

  // Effect to set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    try {
      // Only run in client-side environment
      if (typeof window === 'undefined') {
        return clusterApiUrl(network);
      }

      // Try client-side window.ENV first, then fallback to process.env
      let customRpc;
      
      // Check if window.ENV exists and has SOLANA_RPC property
      if (window.ENV?.SOLANA_RPC) {
        customRpc = window.ENV.SOLANA_RPC;
      } 
      // Fallback to NEXT_PUBLIC_SOLANA_RPC
      else if (process.env.NEXT_PUBLIC_SOLANA_RPC) {
        customRpc = process.env.NEXT_PUBLIC_SOLANA_RPC;
      }
      
      if (customRpc) {
        return customRpc;
      }
      
      // Handle network-specific RPC URLs
      if (window.ENV?.SOLANA_NETWORK === 'Devnet') {
        network = WalletAdapterNetwork.Devnet;
      } else if (window.ENV?.SOLANA_NETWORK === 'Mainnet') {
        network = WalletAdapterNetwork.Mainnet;
      }
      
      // Fallback to environment-specific RPC URLs
      if (process.env.NEXT_PUBLIC_RPC_URL_SOLANA_DEVNET && network === WalletAdapterNetwork.Devnet) {
        return process.env.NEXT_PUBLIC_RPC_URL_SOLANA_DEVNET;
      }
      
      if (process.env.NEXT_PUBLIC_RPC_URL_SOLANA_MAINNET && network === WalletAdapterNetwork.Mainnet) {
        return process.env.NEXT_PUBLIC_RPC_URL_SOLANA_MAINNET;
      }
      
      // Final fallback to default Solana cluster API
      return clusterApiUrl(network);
    } catch (error) {
      console.error('Error determining RPC endpoint:', error);
      // Fallback to a safe default
      return clusterApiUrl(network);
    }
  }, [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(
    () => {
      try {
        if (typeof window === 'undefined') {
          return []; // Return empty array during SSR
        }

        // Initialize wallets only on client side
        return [
          new PhantomWalletAdapter(),
          new SolflareWalletAdapter(),
          new CoinbaseWalletAdapter(),
          new TrustWalletAdapter(),
        ];
      } catch (error) {
        console.error('Error initializing wallet adapters:', error);
        return []; // Return empty array on error
      }
    },
    [network]
  );

  // Return a simplified tree during SSR
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  // Return children only during initial client-side hydration
  if (!mounted) {
    return <>{children}</>;
  }

  // Once mounted and on client-side, render full wallet provider tree
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider;
