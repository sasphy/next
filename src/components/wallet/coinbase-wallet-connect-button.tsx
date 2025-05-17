'use client';

import { FC, useEffect, useState, useCallback } from 'react';
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
  const [provider, setProvider] = useState<any>(null);
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

      setProvider(web3Provider);

      // Check if already connected
      if (web3Provider) {
        web3Provider
          .request({ method: 'eth_accounts' })
          .then((accounts: string[]) => {
            if (accounts && accounts.length > 0) {
              handleAccountsChanged(accounts);
            }
          })
          .catch((error: Error) => console.error('Error checking accounts', error));

        // Setup event listeners with proper type handling
        const accountsChangedHandler = (accounts: unknown) => {
          handleAccountsChanged(accounts as string[]);
        };
        
        web3Provider.on('accountsChanged', accountsChangedHandler);
        web3Provider.on('chainChanged', handleChainChanged);
        web3Provider.on('disconnect', handleDisconnect);
        
        // Store the provider and handlers for cleanup
        setProvider({
          provider: web3Provider,
          accountsChangedHandler,
        });
      }
    }

    return () => {
      // Cleanup event listeners
      if (provider && provider.provider) {
        provider.provider.removeListener('accountsChanged', provider.accountsChangedHandler);
        provider.provider.removeListener('chainChanged', handleChainChanged);
        provider.provider.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [chainId, network, handleAccountsChanged]);

  const connectWallet = async () => {
    if (!provider || !provider.provider) {
      console.error('Provider not initialized');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await provider.provider.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!provider || !provider.provider) return;

    try {
      await provider.provider.disconnect();
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
            variant="secondary" 
            size="sm" 
            className="font-medium"
            onClick={disconnectWallet}
          >
            {`${address.substring(0, 6)}...${address.substring(address.length - 4)}`}
          </Button>
        </div>
      ) : (
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          className="relative bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          {isConnecting ? 'Connecting...' : 'Coinbase Smart Wallet'}
        </Button>
      )}
    </div>
  );
};

export default CoinbaseWalletConnectButton; 