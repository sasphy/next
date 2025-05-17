'use client';

import { FC, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCoinbaseSmartWallet } from '@/hooks/use-coinbase-smart-wallet';
import { motion } from 'framer-motion';
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
  const {
    connectWallet,
    disconnectWallet,
    signIn,
    address,
    isConnected,
    isConnecting,
    isLoggingIn,
    isAuthenticated,
    getCapabilities
  } = useCoinbaseSmartWallet();
  
  const [capabilities, setCapabilities] = useState<any>(null);
  const [hasPaymaster, setHasPaymaster] = useState(false);
  
  // Attempt to fetch wallet capabilities
  useEffect(() => {
    if (isConnected && address) {
      getCapabilities().then(caps => {
        setCapabilities(caps);
        // Check if paymaster service is supported
        if (caps && Object.keys(caps).some(chainId => 
          caps[chainId]?.paymasterService?.supported)) {
          setHasPaymaster(true);
        }
      });
    }
  }, [isConnected, address, getCapabilities]);

  // Handle connect button click
  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      if (addr && onWalletConnect) {
        // Attempt to sign in
        await signIn();
        onWalletConnect(addr);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  // JSX for the button when wallet is connected
  const connectedButton = (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        className="font-medium py-1.5 px-4 rounded-lg flex items-center gap-2"
        onClick={disconnectWallet}
      >
        {hasPaymaster && (
          <div className="relative flex items-center mr-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <motion.span 
              className="absolute h-2 w-2 rounded-full bg-green-500"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ opacity: 0.5 }}
            />
          </div>
        )}
        {`${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`}
      </Button>
    </div>
  );

  // JSX for the button when wallet is not connected
  const disconnectedButton = (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-1.5 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
    >
      {isConnecting ? (
        <>
          <motion.div 
            className="h-3 w-3 rounded-full bg-white/80"
            animate={{ scale: [1, 0.8, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
          Connecting...
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0C12.4183 0 16 3.58172 16 8C16 12.4183 12.4183 16 8 16C3.58172 16 0 12.4183 0 8C0 3.58172 3.58172 0 8 0Z" fill="#0052FF"/>
            <path d="M8.00002 3.46667C5.52302 3.46667 3.51969 5.47 3.51969 7.94667C3.51969 10.4233 5.52302 12.4267 8.00002 12.4267C10.477 12.4267 12.4803 10.4233 12.4803 7.94667C12.4803 5.47 10.477 3.46667 8.00002 3.46667ZM6.28502 9.91333V6.06667H9.76969V9.91333H6.28502Z" fill="white"/>
          </svg>
          Smart Wallet
        </>
      )}
    </Button>
  );

  // Return connected or disconnected button based on wallet state
  return (
    <div className={`coinbase-wallet-connect ${className}`}>
      {isConnected ? connectedButton : disconnectedButton}
    </div>
  );
};

export default CoinbaseWalletConnectButton; 