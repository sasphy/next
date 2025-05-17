'use client';

import { FC, ReactNode, useMemo, useState, useEffect, createContext, useContext } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Create a context for the Coinbase Smart Wallet provider
export interface CoinbaseWalletContextState {
  provider: any;
  sdk: CoinbaseWalletSDK | null;
  chainId: number;
  isInitialized: boolean;
}

const CoinbaseWalletContext = createContext<CoinbaseWalletContextState>({
  provider: null,
  sdk: null,
  chainId: 0,
  isInitialized: false,
});

export const useCoinbaseWallet = () => useContext(CoinbaseWalletContext);

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
  const [isInitialized, setIsInitialized] = useState(false);
  
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
    
    try {
      const coinbaseSdk = new CoinbaseWalletSDK({
        appName: 'Sasphy Music',
        appChainIds: [chainId],
        appLogoUrl: window.location.origin + '/assets/logos/sasphy_logo.svg',
      });
      setIsInitialized(true);
      return coinbaseSdk;
    } catch (error) {
      console.error('Error creating Coinbase Wallet SDK:', error);
      return null;
    }
  }, [chainId]);
  
  // Create the Web3 provider
  const provider = useMemo(() => {
    if (!sdk) return null;
    
    try {
      // Create provider with Smart Wallet preference
      return sdk.makeWeb3Provider({
        options: 'smartWalletOnly',
      });
    } catch (error) {
      console.error('Error creating Coinbase Wallet provider:', error);
      return null;
    }
  }, [sdk]);

  // Provide value to context
  const contextValue = useMemo(() => ({
    provider,
    sdk,
    chainId,
    isInitialized,
  }), [provider, sdk, chainId, isInitialized]);

  // Return empty children during server-side rendering
  if (typeof window === 'undefined') {
    return <CoinbaseWalletContext.Provider value={contextValue}>{children}</CoinbaseWalletContext.Provider>;
  }

  // Return empty children until client-side mounted to prevent hydration mismatch
  if (!mounted) {
    return <CoinbaseWalletContext.Provider value={contextValue}>{children}</CoinbaseWalletContext.Provider>;
  }

  return (
    <CoinbaseWalletContext.Provider value={contextValue}>
      {children}
    </CoinbaseWalletContext.Provider>
  );
};

export default CoinbaseSmartWalletProvider; 