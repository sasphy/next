'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { FC, ReactNode, useEffect, useState } from 'react';
import WalletConnectButton from './wallet-connect-button';

interface WalletGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * A component that ensures the wallet is accessible before rendering children
 * This helps prevent SSR errors with wallet context
 */
export const WalletGuard: FC<WalletGuardProps> = ({ 
  children, 
  fallback = <DefaultFallback />
}) => {
  const { publicKey, connected } = useWallet();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render anything during SSR or until we've confirmed we're on client
  if (!isClient) {
    return null;
  }

  // Render the default fallback or custom fallback if not connected
  if (!connected || !publicKey) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Default fallback UI when wallet is not connected
const DefaultFallback: FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-purple-900/30 bg-black/30">
      <h3 className="text-lg font-medium text-white mb-4">Connect Your Wallet</h3>
      <p className="text-gray-400 text-center mb-6">
        You need to connect your wallet to access this feature
      </p>
      <WalletConnectButton />
    </div>
  );
};

export default WalletGuard;