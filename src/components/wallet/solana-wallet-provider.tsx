'use client';

import { FC, ReactNode, useMemo } from 'react';
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
  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => {
    // Try client-side window.ENV first, then fallback to process.env
    const customRpc = 
      (typeof window !== 'undefined' && window.ENV?.SOLANA_RPC) || 
      process.env.NEXT_PUBLIC_SOLANA_RPC;
    
    if (customRpc) {
      return customRpc;
    }
    
    // Fallback to environment-specific RPC URLs
    if (process.env.RPC_URL_SOLANA_DEVNET && network === WalletAdapterNetwork.Devnet) {
      return process.env.RPC_URL_SOLANA_DEVNET;
    }
    
    if (process.env.RPC_URL_SOLANA_MAINNET && network === WalletAdapterNetwork.Mainnet) {
      return process.env.RPC_URL_SOLANA_MAINNET;
    }
    
    // Final fallback to default Solana cluster API
    return clusterApiUrl(network);
  }, [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default SolanaWalletProvider;
