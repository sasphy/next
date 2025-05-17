'use client';

import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import WalletConnectButton from './wallet-connect-button';

// We dynamically import the Coinbase wallet button to avoid SSR issues
const CoinbaseWalletConnectButton = dynamic(
  () => import('./coinbase-wallet-connect-button'),
  { ssr: false }
);

interface Props {
  className?: string;
}

const CombinedWalletConnectButton: FC<Props> = ({ className = '', ...props }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCoinbaseWalletConnect = (address: string) => {
    console.log('Coinbase wallet connected:', address);
    setIsOpen(false);
  };

  const handleWalletConnect = (address: string) => {
    console.log('Wallet connected:', address);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          className={`bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-1.5 px-4 rounded-lg font-medium flex items-center gap-1.5 ${className}`}
        >
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="wallet-dialog sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <WalletConnectButton 
            onWalletConnect={handleWalletConnect} 
            className="w-full"
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <CoinbaseWalletConnectButton 
            onWalletConnect={handleCoinbaseWalletConnect} 
            className="w-full"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CombinedWalletConnectButton; 