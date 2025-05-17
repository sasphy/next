'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { useSasphy } from '@/components/providers/sasphy-provider';
import bs58 from 'bs58';

/**
 * Hook for Coinbase Smart Wallet integration
 * Provides wallet connection, authentication, and transaction capabilities
 */
export function useCoinbaseSmartWallet() {
  const [mounted, setMounted] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number>(8453); // Base mainnet by default
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const providerRef = useRef<any>(null);
  const sdkRef = useRef<CoinbaseWalletSDK | null>(null);
  
  const { login, logout, isAuthenticated } = useSasphy();

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      setAddress(null);
    } else {
      setAddress(accounts[0]);
    }
  }, []);

  // Initialize the provider
  useEffect(() => {
    setMounted(true);
    
    // Skip during SSR
    if (typeof window === 'undefined') return;

    // Determine chain ID based on network
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
        appLogoUrl: window.location.origin + '/assets/logos/sasphy_logo.svg',
      });
      
      sdkRef.current = sdk;

      // Create provider with Smart Wallet preference
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
            // Ignore error if just not connected yet
            console.log('Not connected:', error);
          });

        // Setup event listeners
        const accountsChangedHandler = (accounts: unknown) => {
          if (Array.isArray(accounts)) {
            handleAccountsChanged(accounts);
          }
        };
        
        web3Provider.on('accountsChanged', accountsChangedHandler);
        web3Provider.on('chainChanged', (chainId: string) => {
          console.log('Chain changed to:', chainId);
        });
        web3Provider.on('disconnect', () => {
          setAddress(null);
        });
        
        // Return cleanup function
        return () => {
          if (web3Provider) {
            web3Provider.removeListener('accountsChanged', accountsChangedHandler);
            web3Provider.removeListener('chainChanged', () => {});
            web3Provider.removeListener('disconnect', () => {});
          }
        };
      }
    } catch (error) {
      console.error('Failed to initialize Coinbase wallet provider:', error);
    }
  }, [chainId, handleAccountsChanged]);

  // Connect to wallet
  const connectWallet = useCallback(async () => {
    if (!providerRef.current) {
      console.error('Provider not initialized');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await providerRef.current.request({ method: 'eth_requestAccounts' });
      handleAccountsChanged(accounts);
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [handleAccountsChanged]);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    if (!providerRef.current) return;

    try {
      await providerRef.current.disconnect();
      setAddress(null);
      await logout();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  }, [logout]);

  // Sign message and authenticate
  const signIn = useCallback(async () => {
    if (!address || !providerRef.current) {
      console.warn('Wallet not connected');
      return;
    }

    setIsLoggingIn(true);
    try {
      // Create a challenge message
      const message = `Welcome to Sasphy Music!\n\nSign this message to authenticate with your wallet.\n\nNonce: ${Date.now()}`;
      
      // Request signature
      const signature = await providerRef.current.request({
        method: 'personal_sign',
        params: [message, address]
      });
      
      // Call login from Sasphy provider
      await login(address, signature);
      console.log('Authentication successful');
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [address, login]);

  // Auto-connect logic
  useEffect(() => {
    if (!mounted) return;
    
    if (address && !isAuthenticated && !isLoggingIn) {
      // Could enable auto sign-in here
      // signIn();
    }
  }, [address, isAuthenticated, isLoggingIn, signIn, mounted]);

  // Check for wallet capabilities (like paymaster support)
  const getCapabilities = useCallback(async () => {
    if (!providerRef.current || !address) return null;
    
    try {
      const capabilities = await providerRef.current.request({
        method: 'wallet_getCapabilities'
      });
      
      return capabilities;
    } catch (error) {
      console.error('Error getting capabilities:', error);
      return null;
    }
  }, [address]);

  // Send transaction with paymaster
  const sendTransaction = useCallback(async (to: string, value: string, data: string = '0x') => {
    if (!providerRef.current || !address) return null;
    
    try {
      // Get transaction params
      const txParams = {
        from: address,
        to,
        value,
        data
      };
      
      // Try to get capabilities
      const capabilities = await getCapabilities();
      let txOptions = {};
      
      // If paymaster service is supported, include it
      if (capabilities && capabilities[chainId] && capabilities[chainId].paymasterService) {
        txOptions = {
          capabilities: {
            paymasterService: {
              url: process.env.NEXT_PUBLIC_PAYMASTER_URL || '/api/paymaster'
            }
          }
        };
      }
      
      // Send the transaction
      const txHash = await providerRef.current.request({
        method: 'eth_sendTransaction',
        params: [txParams, txOptions]
      });
      
      return txHash;
    } catch (error) {
      console.error('Error sending transaction:', error);
      return null;
    }
  }, [address, chainId, getCapabilities]);

  // Return default values during SSR
  if (!mounted) {
    return {
      connectWallet,
      disconnectWallet,
      signIn,
      sendTransaction,
      getCapabilities,
      address: null,
      isConnected: false,
      isConnecting: false,
      isLoggingIn: false,
      isAuthenticated: false,
      provider: null,
      sdk: null,
    };
  }

  return {
    connectWallet,
    disconnectWallet, 
    signIn,
    sendTransaction,
    getCapabilities,
    address,
    isConnected: !!address,
    isConnecting,
    isLoggingIn,
    isAuthenticated,
    provider: providerRef.current,
    sdk: sdkRef.current,
  };
}

export default useCoinbaseSmartWallet; 