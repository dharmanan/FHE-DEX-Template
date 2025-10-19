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
      const ethBal = await provider.getBalance(address, 'latest');
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
        
        // Call with 'latest' block to bypass cache
        const tokenBal = await tokenContract.balanceOf(address);
        const tokenAmount = parseFloat(formatUnits(tokenBal, 18));
        setUserTokenBalance(tokenAmount);
        console.log('[useAppState] Token balance loaded:', tokenAmount, '(raw:', tokenBal.toString(), ')');
      } catch (tokenError) {
        console.warn('[useAppState] Token balance loading failed (might not exist yet):', tokenError);
        setUserTokenBalance(0);
      }

      // Get LP balance from DEX
      try {
        const dexContract = new Contract(
          DEX_CONTRACT_ADDRESS,
          DEX_ABI_OBJ,
          provider
        );
        
        const lpBal = await dexContract.getLPBalance(address);
        const lpAmount = parseFloat(formatUnits(lpBal, 18));
        setUserLiquidity(lpAmount);
        console.log('[useAppState] LP balance loaded:', lpAmount, '(raw:', lpBal.toString(), ')');
      } catch (lpError) {
        console.warn('[useAppState] LP balance loading failed:', lpError);
        setUserLiquidity(0);
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

  // Helper to retry a function
  const retryAsync = useCallback(async (fn: () => Promise<void>, maxRetries = 3, delayMs = 500) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await fn();
        return;
      } catch (error) {
        console.warn(`Retry ${i + 1}/${maxRetries} failed:`, error);
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
  }, []);

  // Swap function
  const swap = useCallback(async (inputAmount: number, inputAsset: 'ETH' | 'TOKEN') => {
    if (!userAddress) {
      alert('Please connect wallet first');
      return;
    }

    setIsLoading(true);
    setIsSummaryLoading(true);
    try {
      if (!(window as any).ethereum) {
        throw new Error('MetaMask not available');
      }

      console.log('[useAppState] Starting swap:', { inputAmount, inputAsset });
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
        console.log('[useAppState] Executing swapEthForToken');
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
        console.log('[useAppState] Starting approval for:', tokenAmountBn.toString());
        const approveTx = await tokenContract.approve(DEX_CONTRACT_ADDRESS, tokenAmountBn);
        console.log('[useAppState] Approval tx sent:', approveTx.hash);
        const approveReceipt = await approveTx.wait();
        console.log('[useAppState] Approval confirmed:', approveReceipt?.transactionHash);
        
        // Swap
        console.log('[useAppState] Executing swapTokenForEth with amount:', tokenAmountBn.toString());
        tx = await contract.swapTokenForEth(tokenAmountBn);
      }

      console.log('[useAppState] Waiting for transaction:', tx.hash);
      const receipt = await tx.wait();
      console.log('[useAppState] Swap completed:', { txHash: tx.hash, receipt });

      setTransactionSummary(`✅ Swap successful!\nTx: ${tx.hash.slice(0, 10)}...\n\nReloading balances...`);
      setIsSummaryLoading(false);

      // Reload data with retry - use longer delays to ensure block confirmation
      console.log('[useAppState] Reloading balances and pool state');
      await retryAsync(async () => {
        await loadUserBalances(userAddress);
        await loadPoolReserves();
      }, 8, 2000);  // 8 retries × 2 seconds = 16 seconds total

      console.log('[useAppState] Data reloaded successfully');
      setTransactionSummary(`✅ Swap successful!\nTx: ${tx.hash.slice(0, 10)}...\n\n✅ Balances updated`);
    } catch (error) {
      console.error('[useAppState] Swap failed:', error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      setTransactionSummary(`❌ Swap failed:\n${errorMsg}`);
      setIsSummaryLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, loadUserBalances, loadPoolReserves, retryAsync]);

  // Deposit function
  const deposit = useCallback(async (ethAmount: number) => {
    if (!userAddress) {
      alert('Please connect wallet first');
      return;
    }

    setIsLoading(true);
    setIsSummaryLoading(true);
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
      console.log('[useAppState] Approving token for DEX...');
      const tokenContract = new Contract(
        ZAMA_TOKEN_ADDRESS,
        ZAMA_TOKEN_ABI_OBJ,
        signer
      );
      const approveTx = await tokenContract.approve(DEX_CONTRACT_ADDRESS, tokenBn);
      console.log('[useAppState] Approval tx sent:', approveTx.hash);
      await approveTx.wait();
      console.log('[useAppState] Approval confirmed');

      // Add liquidity
      console.log('[useAppState] Adding liquidity with ETH:', ethBn.toString(), 'Token:', tokenBn.toString());
      const tx = await contract.addLiquidity(tokenBn, { value: ethBn });
      const receipt = await tx.wait();

      console.log('[useAppState] Deposit completed:', { txHash: tx.hash });
      setTransactionSummary(`✅ Liquidity added!\nTx: ${tx.hash.slice(0, 10)}...\n\nReloading data...`);
      setIsSummaryLoading(false);

      // Reload data with retry
      await retryAsync(async () => {
        await loadUserBalances(userAddress);
        await loadPoolReserves();
      }, 8, 2000);

      setTransactionSummary(`✅ Liquidity added!\nTx: ${tx.hash.slice(0, 10)}...\n\n✅ Balances updated`);
    } catch (error) {
      console.error('[useAppState] Deposit failed:', error);
      setTransactionSummary(`❌ Deposit failed: ${error instanceof Error ? error.message : String(error)}`);
      setIsSummaryLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, ethReserve, tokenReserve, loadUserBalances, loadPoolReserves, retryAsync]);

  // Withdraw function
  const withdraw = useCallback(async (lpAmount: number) => {
    if (!userAddress) {
      alert('Please connect wallet first');
      return;
    }

    setIsLoading(true);
    setIsSummaryLoading(true);
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
      setTransactionSummary(`✅ Liquidity withdrawn!\nTx: ${tx.hash.slice(0, 10)}...\n\nReloading data...`);
      setIsSummaryLoading(false);

      // Reload data with retry
      await retryAsync(async () => {
        await loadUserBalances(userAddress);
        await loadPoolReserves();
      }, 8, 2000);

      setTransactionSummary(`✅ Liquidity withdrawn!\nTx: ${tx.hash.slice(0, 10)}...\n\n✅ Balances updated`);
    } catch (error) {
      console.error('[useAppState] Withdraw failed:', error);
      setTransactionSummary(`❌ Withdrawal failed: ${error instanceof Error ? error.message : String(error)}`);
      setIsSummaryLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, loadUserBalances, loadPoolReserves, retryAsync]);

  // Load pool reserves and user balances when user address changes
  useEffect(() => {
    if (userAddress) {
      loadUserBalances(userAddress);
      
      // Poll user balances every 3 seconds for real-time updates
      const userPollInterval = setInterval(() => {
        console.log('[useAppState] Polling user balances...');
        loadUserBalances(userAddress);
      }, 3000);

      return () => clearInterval(userPollInterval);
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

    // Poll pool reserves every 5 seconds for real-time updates
    const poolPollInterval = setInterval(() => {
      loadPoolReserves();
    }, 5000);

    return () => {
      (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      clearInterval(poolPollInterval);
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
