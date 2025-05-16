'use client';

import { FC, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { truncateAddress } from '@/lib/utils';

// Import Solana wallet adapter styles
require('@solana/wallet-adapter-react-ui/styles.css');

const WalletConnectButton: FC = () => {
  // Use a state to track client-side rendering
  const [mounted, setMounted] = useState(false);
  const { publicKey, connecting, disconnecting } = useWallet();

  // Set mounted to true after component mounts to ensure we're on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // If not mounted yet (server-side), render a placeholder button
  if (!mounted) {
    return (
      <div className="wallet-button-wrapper">
        <Button className="custom-wallet-button">
          Connect Wallet
        </Button>
      </div>
    );
  }

  // Custom styles for the wallet button
  return (
    <div className="wallet-button-wrapper">
      <WalletMultiButton className="custom-wallet-button !bg-primary hover:!bg-primary/90 !text-primary-foreground !py-1.5 !h-auto !min-w-0 !rounded-lg !font-medium !transition-colors" />
      
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
        }
        
        .wallet-adapter-modal-button-close {
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        /* Fix for hydration issues */
        .wallet-adapter-button-start-icon {
          display: flex;
          align-items: center;
          margin-right: 8px;
        }
      `}</style>
    </div>
  );
};

export default WalletConnectButton;
