'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { PublicKey, TransactionInstruction, Transaction, Connection } from '@solana/web3.js';

export const useSolanaWallet = () => {
  const wallet = useWallet();
  const { publicKey, signTransaction, signAllTransactions, signMessage, sendTransaction, connecting, connected, disconnecting } = wallet;
  const [isLoadingTransaction, setIsLoadingTransaction] = useState(false);

  const handleSendTransaction = useCallback(async (
    connection: Connection,
    instructions: TransactionInstruction[],
    options?: {
      feePayer?: PublicKey, 
      onSuccess?: (signature: string) => void,
      onError?: (error: any) => void,
    }
  ) => {
    if (!publicKey || !sendTransaction) {
      toast.error('Wallet not connected');
      return null;
    }

    setIsLoadingTransaction(true);
    
    try {
      const transaction = new Transaction();
      transaction.add(...instructions);
      
      const signature = await sendTransaction(transaction, connection);
      
      // Confirm transaction
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        console.error('Transaction confirmed with error', confirmation.value.err);
        options?.onError?.(confirmation.value.err);
        toast.error('Transaction failed');
        return null;
      }
      
      options?.onSuccess?.(signature);
      toast.success('Transaction confirmed');
      return signature;
    } catch (error) {
      console.error('Error sending transaction:', error);
      options?.onError?.(error);
      toast.error('Transaction failed');
      return null;
    } finally {
      setIsLoadingTransaction(false);
    }
  }, [publicKey, sendTransaction]);

  // Utility function to sign a message
  const handleSignMessage = useCallback(async (message: string) => {
    if (!publicKey || !signMessage) {
      toast.error('Wallet not connected');
      return null;
    }

    try {
      // Convert string to Uint8Array
      const messageBytes = new TextEncoder().encode(message);
      const signature = await signMessage(messageBytes);
      return {
        signature,
        publicKey: publicKey.toBase58(),
      };
    } catch (error) {
      console.error('Error signing message:', error);
      toast.error('Failed to sign message');
      return null;
    }
  }, [publicKey, signMessage]);

  return {
    ...wallet,
    isLoadingTransaction,
    handleSendTransaction,
    handleSignMessage,
    walletAddress: publicKey?.toBase58() || '',
  };
};
