'use client';

import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { PublicKey } from '@solana/web3.js';

// Import Solana wallet adapter styles
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletConnectButtonProps {
  onWalletConnect?: (address: string) => void;
  className?: string;
}

const WalletConnectButton: FC<WalletConnectButtonProps> = ({ 
  onWalletConnect,
  className = ''
}) => {
  // Use a state to track client-side rendering
  const [mounted, setMounted] = useState(false);
  
  // Use a safe access pattern to avoid errors during hydration
  const wallet = useWallet();
  const [walletState, setWalletState] = useState({
    connected: false,
    connecting: false,
    disconnecting: false,
    publicKey: null as PublicKey | null
  });

  // Set mounted to true after component mounts to ensure we're on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Update wallet state safely after hydration
  useEffect(() => {
    if (mounted && wallet) {
      setWalletState({
        connected: wallet.connected || false,
        connecting: wallet.connecting || false,
        disconnecting: wallet.disconnecting || false,
        publicKey: wallet.publicKey
      });

      // Notify parent component when wallet connects
      if (wallet.connected && wallet.publicKey && onWalletConnect) {
        onWalletConnect(wallet.publicKey.toString());
      }
    }
  }, [
    mounted, 
    wallet, 
    wallet?.connected, 
    wallet?.connecting, 
    wallet?.disconnecting, 
    wallet?.publicKey,
    onWalletConnect
  ]);

  // If not mounted yet (server-side), render a placeholder button
  if (!mounted) {
    return (
      <div className={`wallet-button-wrapper ${className}`}>
        <Button className="custom-wallet-button bg-primary hover:bg-primary/90 text-primary-foreground py-1.5 h-10 rounded-lg font-medium transition-colors">
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Custom styles for the wallet button
  return (
    <div 
      className={`wallet-button-wrapper relative ${className}`} 
      data-mounted={mounted} 
      data-connected={walletState.connected}
    >
      <WalletMultiButton className="custom-wallet-button !bg-primary hover:!bg-primary/90 !text-primary-foreground !py-1.5 !h-10 !rounded-lg !font-medium !transition-colors" />
      
      {/* Custom styles will be applied in globals.css */}
      <style jsx global>{`
        .wallet-adapter-button {
          background: linear-gradient(180deg, #9945FF 0%, #7A3CCC 100%) !important;
          border-radius: 8px !important;
          height: 40px !important;
          padding: 0 16px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          transition: all 0.2s ease-in-out !important;
        }
        
        .wallet-adapter-button:hover {
          background: linear-gradient(180deg, #B366FF 0%, #8A4DE6 100%) !important;
          transform: translateY(-1px) !important;
        }
        
        .wallet-adapter-button:active {
          transform: translateY(1px) !important;
        }
        
        .wallet-adapter-modal-wrapper {
          background: rgba(22, 22, 26, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          border-radius: 16px !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          z-index: 999999 !important;
        }
        
        .wallet-adapter-modal-button-close {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Fix for hydration issues */
        .wallet-adapter-button-start-icon {
          display: flex !important;
          align-items: center !important;
          margin-right: 8px !important;
        }

        /* Ensure the modal appears on top of everything */
        .wallet-adapter-modal {
          z-index: 999999 !important;
        }
      `}</style>
    </div>
  );
};

export default WalletConnectButton;
