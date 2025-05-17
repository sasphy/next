'use client';

import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

interface CoinbaseWalletConnectButtonProps {
  onWalletConnect?: (address: string) => void;
  network?: WalletAdapterNetwork;
  className?: string;
}

const CoinbaseWalletConnectButton: FC<CoinbaseWalletConnectButtonProps> = ({ 
  onWalletConnect,
  network = WalletAdapterNetwork.Devnet,
  className = ''
}) => {
  const [mounted, setMounted] = useState(false);
  const providerRef = useRef<any>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(8453); // Base mainnet by default
  const [isConnecting, setIsConnecting] = useState(false);

  // Define the accounts changed handler with useCallback
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress(null);
    } else {
      setAddress(accounts[0]);
      // Notify parent component if callback provided
      if (onWalletConnect) {
        onWalletConnect(accounts[0]);
      }
    }
  }, [onWalletConnect]);

  const handleChainChanged = (chainId: string) => {
    console.log('Chain changed to:', chainId);
    // You can add additional handling here if needed
  };

  const handleDisconnect = () => {
    setAddress(null);
  };

  // Initialize only on client-side
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

      try {
        // Initialize Coinbase Wallet SDK
        const sdk = new CoinbaseWalletSDK({
          appName: 'Sasphy Music',
          appChainIds: [chainId],
          appLogoUrl: '/assets/logo.svg', // Update with your app's logo
        });

        // Create the provider with Smart Wallet preferences
        const web3Provider = sdk.makeWeb3Provider({
          options: 'smartWalletOnly',
        });

        providerRef.current = web3Provider;

        // Check if already connected
        if (web3Provider) {
          web3Provider.request({ method: 'eth_requestAccounts' })
            .then((accounts: string[] | unknown) => {
              if (Array.isArray(accounts) && accounts.length > 0) {
                handleAccountsChanged(accounts);
              }
            })
            .catch((error) => {
              console.error('Error checking accounts:', error || 'Unknown error');
            });

          // Setup event listeners with proper type handling
          const accountsChangedHandler = (accounts: unknown) => {
            if (Array.isArray(accounts) && accounts.length > 0) {
              handleAccountsChanged(accounts as string[]);
            }
          };
          
          web3Provider.on('accountsChanged', accountsChangedHandler);
          web3Provider.on('chainChanged', handleChainChanged);
          web3Provider.on('disconnect', handleDisconnect);
          
          // Store event handlers for cleanup
          return () => {
            if (web3Provider) {
              web3Provider.removeListener('accountsChanged', accountsChangedHandler);
              web3Provider.removeListener('chainChanged', handleChainChanged);
              web3Provider.removeListener('disconnect', handleDisconnect);
            }
          };
        }
      } catch (error) {
        console.error('Failed to initialize Coinbase wallet provider:', error);
      }
    }
  }, [chainId, network, handleAccountsChanged]);

  const connectWallet = async () => {
    if (!providerRef.current) {
      console.error('Provider not initialized');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await providerRef.current.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!providerRef.current) return;

    try {
      await providerRef.current.disconnect();
      setAddress(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  // Don't render until client-side to prevent hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <div className={`coinbase-wallet-connect ${className}`}>
      {address ? (
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            className="font-medium py-1.5 px-4 rounded-lg"
            onClick={disconnectWallet}
          >
            {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
          </Button>
        </div>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-1.5 px-4 rounded-lg font-medium transition-colors"
        >
          {isConnecting ? 'Connecting...' : 'Coinbase Smart Wallet'}
        </Button>
      )}
    </div>
  );
};

export default CoinbaseWalletConnectButton; 