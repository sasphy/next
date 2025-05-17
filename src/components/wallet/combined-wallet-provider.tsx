'use client';

import { FC, ReactNode, useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolanaWalletProvider } from './solana-wallet-provider';
import dynamic from 'next/dynamic';

// Dynamically import the Coinbase Smart Wallet component to avoid SSR issues
const CoinbaseSmartWalletProvider = dynamic(
  () => import('./coinbase-smart-wallet-provider'),
  { ssr: false }
);

interface CombinedWalletProviderProps {
  children: ReactNode;
  network?: WalletAdapterNetwork;
}

export const CombinedWalletProvider: FC<CombinedWalletProviderProps> = ({
  children,
  network = WalletAdapterNetwork.Devnet
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Server-side rendering - return children without providers
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <SolanaWalletProvider network={network}>
      <CoinbaseSmartWalletProvider network={network}>
        {children}
      </CoinbaseSmartWalletProvider>
    </SolanaWalletProvider>
  );
};

export default CombinedWalletProvider; 