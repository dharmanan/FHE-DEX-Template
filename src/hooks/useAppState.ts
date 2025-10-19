/**
 * useAppState Hook
 * Provides all the state and functions that App.tsx needs
 */

import { useState, useCallback, useEffect } from 'react';
import { BrowserProvider, Contract, formatEther, formatUnits, parseEther, parseUnits } from 'ethers';
import { UseDEXReturnType } from '../../types';
import { 
  DEX_CONTRACT_ADDRESS, 
  ZAMA_TOKEN_ADDRESS, 
  DEX_ABI_OBJ, 
  ZAMA_TOKEN_ABI_OBJ 
} from '../../constants';

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

  // Load pool reserves from blockchain
  const loadPoolReserves = useCallback(async () => {
    try {
      if (!(window as any).ethereum) {
        console.warn('[useAppState] ethereum not available');
        return;
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const contract = new Contract(
        DEX_CONTRACT_ADDRESS,
        DEX_ABI_OBJ,
        provider
      );

      if (contract.getPoolReserves) {
        const reserves = await contract.getPoolReserves();
        const ethRes = parseFloat(formatEther(reserves.ethBalance || reserves[0] || '0'));
        const tokenRes = parseFloat(formatUnits(reserves.tokenBalance || reserves[1] || '0', 18));
        
        setEthReserve(ethRes > 0 ? ethRes : 1.0);
        setTokenReserve(tokenRes > 0 ? tokenRes : 100.0);
        
        console.log('[useAppState] Pool reserves loaded:', { ethRes, tokenRes });
      }
    } catch (error) {
      console.warn('[useAppState] Failed to load pool reserves:', error);
      // Keep default values
    }
  }, []);

  // Load user balances from blockchain
  const loadUserBalances = useCallback(async (address: string) => {
    try {
      console.log('[useAppState] Starting to load balances for:', address);
      
      if (!(window as any).ethereum) {
        console.warn('[useAppState] ethereum not available');
        return;
      }

      const provider = new BrowserProvider((window as any).ethereum);
      console.log('[useAppState] Provider created');
      
      // Get ETH balance
      const ethBal = await provider.getBalance(address);
      const ethAmount = parseFloat(formatEther(ethBal));
      setUserEthBalance(ethAmount);
      console.log('[useAppState] ETH balance loaded:', ethAmount);

      // Get token balance
      try {
        const tokenContract = new Contract(
          ZAMA_TOKEN_ADDRESS,
          ZAMA_TOKEN_ABI_OBJ,
          provider
        );
        
        const tokenBal = await tokenContract.balanceOf(address);
        const tokenAmount = parseFloat(formatUnits(tokenBal, 18));
        setUserTokenBalance(tokenAmount);
        console.log('[useAppState] Token balance loaded:', tokenAmount);
      } catch (tokenError) {
        console.warn('[useAppState] Token balance loading failed (might not exist yet):', tokenError);
        setUserTokenBalance(0);
      }

      console.log('[useAppState] User balances loaded successfully');
    } catch (error) {
      console.error('[useAppState] Failed to load user balances:', error);
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      if (!(window as any).ethereum) {
        alert('MetaMask not installed');
        return;
      }

      console.log('[useAppState] Requesting accounts...');
      const accounts = await (window as any).ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setUserAddress(address);
        console.log('[useAppState] Connected to:', address);

        // Get chain ID
        const chainIdHex = await (window as any).ethereum.request({ 
          method: 'eth_chainId' 
        });
        const chainIdNum = parseInt(chainIdHex, 16);
        setChainId(chainIdNum);
        console.log('[useAppState] Chain ID:', chainIdNum);

        // Load blockchain data
        console.log('[useAppState] Loading user balances...');
        await loadUserBalances(address);
        console.log('[useAppState] Loading pool reserves...');
        await loadPoolReserves();
        console.log('[useAppState] All data loaded');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`Connection failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [loadUserBalances, loadPoolReserves]);

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
    if (!userAddress) {
      alert('Please connect wallet first');
      return;
    }

    setIsLoading(true);
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not available');
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        DEX_CONTRACT_ADDRESS,
        DEX_ABI_OBJ,
        signer
      );

      let tx;
      const amountBn = parseEther(inputAmount.toString());

      if (inputAsset === 'ETH') {
        // Swap ETH for Token
        tx = await contract.swapEthForToken({ value: amountBn });
      } else {
        // Swap Token for ETH
        const tokenContract = new Contract(
          ZAMA_TOKEN_ADDRESS,
          ZAMA_TOKEN_ABI_OBJ,
          signer
        );
        
        const tokenAmountBn = parseUnits(inputAmount.toString(), 18);
        
        // Approve token transfer
        await tokenContract.approve(DEX_CONTRACT_ADDRESS, tokenAmountBn);
        
        // Swap
        tx = await contract.swapTokenForEth(tokenAmountBn);
      }

      const receipt = await tx.wait();
      console.log('[useAppState] Swap completed:', { txHash: tx.hash });

      setTransactionSummary(`✅ Swap successful!\nTx: ${tx.hash.slice(0, 10)}...`);

      // Reload data
      await loadUserBalances(userAddress);
      await loadPoolReserves();
    } catch (error) {
      console.error('[useAppState] Swap failed:', error);
      setTransactionSummary(`❌ Swap failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, loadUserBalances, loadPoolReserves]);

  // Deposit function
  const deposit = useCallback(async (ethAmount: number) => {
    if (!userAddress) {
      alert('Please connect wallet first');
      return;
    }

    setIsLoading(true);
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not available');
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        DEX_CONTRACT_ADDRESS,
        DEX_ABI_OBJ,
        signer
      );

      const ethBn = parseEther(ethAmount.toString());
      const tokenAmount = (ethAmount / ethReserve) * tokenReserve;
      const tokenBn = parseUnits(tokenAmount.toString(), 18);

      // Approve token transfer
      const tokenContract = new Contract(
        ZAMA_TOKEN_ADDRESS,
        ZAMA_TOKEN_ABI_OBJ,
        signer
      );
      await tokenContract.approve(DEX_CONTRACT_ADDRESS, tokenBn);

      // Add liquidity
      const tx = await contract.addLiquidity(tokenBn, { value: ethBn });
      const receipt = await tx.wait();

      console.log('[useAppState] Deposit completed:', { txHash: tx.hash });
      setTransactionSummary(`✅ Liquidity added!\nTx: ${tx.hash.slice(0, 10)}...`);

      // Reload data
      await loadUserBalances(userAddress);
      await loadPoolReserves();
    } catch (error) {
      console.error('[useAppState] Deposit failed:', error);
      setTransactionSummary(`❌ Deposit failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, ethReserve, tokenReserve, loadUserBalances, loadPoolReserves]);

  // Withdraw function
  const withdraw = useCallback(async (lpAmount: number) => {
    if (!userAddress) {
      alert('Please connect wallet first');
      return;
    }

    setIsLoading(true);
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not available');
      }

      const provider = new BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(
        DEX_CONTRACT_ADDRESS,
        DEX_ABI_OBJ,
        signer
      );

      const lpBn = parseUnits(lpAmount.toString(), 18);
      const tx = await contract.removeLiquidity(lpBn);
      const receipt = await tx.wait();

      console.log('[useAppState] Withdraw completed:', { txHash: tx.hash });
      setTransactionSummary(`✅ Liquidity withdrawn!\nTx: ${tx.hash.slice(0, 10)}...`);

      // Reload data
      await loadUserBalances(userAddress);
      await loadPoolReserves();
    } catch (error) {
      console.error('[useAppState] Withdraw failed:', error);
      setTransactionSummary(`❌ Withdrawal failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, loadUserBalances, loadPoolReserves]);

  // Load pool reserves and user balances when user address changes
  useEffect(() => {
    if (userAddress) {
      loadUserBalances(userAddress);
    }
  }, [userAddress, loadUserBalances]);

  // Listen for account/chain changes and load pool data on mount
  useEffect(() => {
    // Load pool reserves on mount
    loadPoolReserves();

    if (!(window as any).ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        setUserAddress(accounts[0]);
        loadUserBalances(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainIdNum = parseInt(chainIdHex, 16);
      setChainId(chainIdNum);
      // Reload pool data if chain changed
      loadPoolReserves();
    };

    (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
    (window as any).ethereum.on('chainChanged', handleChainChanged);

    return () => {
      (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [loadPoolReserves, loadUserBalances, disconnectWallet]);

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
