/**
 * useAppState Hook
 * Provides all the state and functions that App.tsx needs
 */

import { useState, useCallback, useEffect } from 'react';
import { UseDEXReturnType } from '../../types';

export function useAppState(): UseDEXReturnType {
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [userEthBalance, setUserEthBalance] = useState(0);
  const [userTokenBalance, setUserTokenBalance] = useState(0);
  const [ethReserve, setEthReserve] = useState(1.0);
  const [tokenReserve, setTokenReserve] = useState(100.0);
  const [userLiquidity, setUserLiquidity] = useState(0);
  const [totalLiquidity, setTotalLiquidity] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState<string | null>(null);

  const TOKEN_SYMBOL = 'ZAMA';
  const TOKEN_NAME = 'Zama Token';

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (!(window as any).ethereum) {
        alert('MetaMask not installed');
        return;
      }

      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        setUserAddress(accounts[0]);

        // Get chain ID
        const chainIdHex = await (window as any).ethereum.request({ 
          method: 'eth_chainId' 
        });
        const chainIdNum = parseInt(chainIdHex, 16);
        setChainId(chainIdNum);

        // Get balance
        const balanceHex = await (window as any).ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        });
        const balanceWei = parseInt(balanceHex, 16);
        const balanceEth = balanceWei / 1e18;
        setUserEthBalance(balanceEth);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setUserAddress(null);
    setChainId(null);
    setUserEthBalance(0);
    setUserTokenBalance(0);
  }, []);

  // Clear transaction summary
  const clearTransactionSummary = useCallback(() => {
    setTransactionSummary(null);
  }, []);

  // Swap function
  const swap = useCallback(async (inputAmount: number, inputAsset: 'ETH' | 'TOKEN') => {
    setIsLoading(true);
    try {
      // Mock swap logic
      console.log(`Swapping ${inputAmount} ${inputAsset}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (inputAsset === 'ETH') {
        setUserTokenBalance(prev => prev + (inputAmount * 100));
      } else {
        setUserEthBalance(prev => prev + (inputAmount / 100));
      }
      
      setTransactionSummary(`Swap completed: ${inputAmount} ${inputAsset}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Deposit function
  const deposit = useCallback(async (ethAmount: number) => {
    setIsLoading(true);
    try {
      console.log(`Depositing ${ethAmount} ETH`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserLiquidity(prev => prev + ethAmount);
      setTransactionSummary(`Deposit completed: ${ethAmount} ETH`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Withdraw function
  const withdraw = useCallback(async (lpAmount: number) => {
    setIsLoading(true);
    try {
      console.log(`Withdrawing ${lpAmount} LP`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUserLiquidity(prev => prev - lpAmount);
      setTransactionSummary(`Withdrawal completed: ${lpAmount} LP`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!(window as any).ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setUserAddress(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainIdNum = parseInt(chainIdHex, 16);
      setChainId(chainIdNum);
    };

    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    (window as any).ethereum.on('chainChanged', handleChainChanged);

    return () => {
      (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [disconnectWallet]);

  return {
    ethReserve,
    tokenReserve,
    userEthBalance,
    userTokenBalance,
    userLiquidity,
    totalLiquidity,
    isLoading,
    isSummaryLoading,
    isLiveMode,
    transactionSummary,
    TOKEN_SYMBOL,
    TOKEN_NAME,
    userAddress,
    chainId,
    setIsLiveMode,
    swap,
    deposit,
    withdraw,
    clearTransactionSummary,
    connectWallet,
    disconnectWallet,
  };
}
