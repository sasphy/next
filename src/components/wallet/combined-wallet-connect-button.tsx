'use client';

import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import WalletConnectButton from './wallet-connect-button';

// Dynamically import the Coinbase Wallet Connect Button to avoid SSR issues
const CoinbaseWalletConnectButton = dynamic(
  () => import('./coinbase-wallet-connect-button'),
  { ssr: false }
);

interface CombinedWalletConnectButtonProps {
  onWalletConnect?: (address: string, walletType: 'solana' | 'coinbase') => void;
  className?: string;
}

export const CombinedWalletConnectButton: FC<CombinedWalletConnectButtonProps> = ({ 
  onWalletConnect,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCoinbaseWalletConnect = (address: string) => {
    if (onWalletConnect) {
      onWalletConnect(address, 'coinbase');
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className={`connect-wallet-button ${className}`}
          size="sm"
        >
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="wallet-dialog sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold mb-4">Connect Your Wallet</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="solana-wallet-option">
            <h3 className="text-base font-medium mb-2">Solana Wallets</h3>
            <WalletConnectButton />
          </div>
          <div className="divider h-px bg-border my-3" />
          <div className="coinbase-wallet-option">
            <h3 className="text-base font-medium mb-2">Coinbase Smart Wallet</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Fast, secure wallet using passkeys - no app or extension required.
            </p>
            <CoinbaseWalletConnectButton 
              onWalletConnect={handleCoinbaseWalletConnect}
              className="w-full"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedWalletConnectButton; 