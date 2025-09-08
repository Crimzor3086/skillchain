import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import toast from 'react-hot-toast';

export const useWalletConnection = () => {
  const { connection } = useConnection();
  const { 
    publicKey, 
    connected, 
    connecting, 
    disconnect,
    wallet,
    wallets,
    select
  } = useWallet();
  
  const [balance, setBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch wallet balance when connected
  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
    } else {
      setBalance(0);
    }
  }, [connected, publicKey, connection]);

  const fetchBalance = async () => {
    if (!publicKey || !connection) return;
    
    setIsLoadingBalance(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch wallet balance');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const connectWallet = async (walletName) => {
    try {
      const selectedWallet = wallets.find(w => w.adapter.name === walletName);
      if (selectedWallet) {
        select(selectedWallet.adapter.name);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = async () => {
    try {
      await disconnect();
      toast.success('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast.error('Failed to disconnect wallet');
    }
  };

  const getWalletInfo = () => {
    if (!connected || !publicKey) return null;
    
    return {
      address: publicKey.toString(),
      shortAddress: `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`,
      balance,
      walletName: wallet?.adapter?.name || 'Unknown',
    };
  };

  const requestAirdrop = async (amount = 1) => {
    if (!publicKey || !connection) {
      toast.error('Wallet not connected');
      return false;
    }

    try {
      toast.loading('Requesting airdrop...');
      
      const signature = await connection.requestAirdrop(
        publicKey,
        amount * LAMPORTS_PER_SOL
      );
      
      await connection.confirmTransaction(signature);
      
      toast.dismiss();
      toast.success(`Airdrop of ${amount} SOL successful!`);
      
      // Refresh balance
      await fetchBalance();
      
      return true;
    } catch (error) {
      toast.dismiss();
      console.error('Airdrop error:', error);
      
      if (error.message.includes('airdrop request limit')) {
        toast.error('Airdrop limit reached. Try again later.');
      } else {
        toast.error('Airdrop failed. Make sure you\'re on devnet.');
      }
      
      return false;
    }
  };

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast.success('Address copied to clipboard');
    }
  };

  const getNetworkInfo = () => {
    const endpoint = connection.rpcEndpoint;
    let network = 'unknown';
    
    if (endpoint.includes('devnet')) {
      network = 'devnet';
    } else if (endpoint.includes('testnet')) {
      network = 'testnet';
    } else if (endpoint.includes('mainnet')) {
      network = 'mainnet-beta';
    } else if (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')) {
      network = 'localnet';
    }
    
    return {
      network,
      endpoint,
    };
  };

  return {
    // Wallet state
    publicKey,
    connected,
    connecting,
    wallet,
    wallets,
    balance,
    isLoadingBalance,
    
    // Wallet actions
    connectWallet,
    disconnectWallet,
    fetchBalance,
    requestAirdrop,
    copyAddress,
    
    // Utility functions
    getWalletInfo,
    getNetworkInfo,
  };
};