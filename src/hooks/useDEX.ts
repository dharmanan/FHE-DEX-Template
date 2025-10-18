/**
 * useDEX Hook
 * Main hook for DEX operations with Oracle callback swaps
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { ethers, BigNumber, Contract } from 'ethers';
import { RelayerClient } from '../services/relayerClient';
import { EncryptionService } from '../services/encryptionService';
import { DecryptedResult } from '../types/relayer';

interface DexConfig {
  contractAddress: string;
  tokenAddress: string;
  contractAbi: any[];
  tokenAbi: any[];
  relayerEndpoint?: string;
  chainId?: number;
}

interface DexState {
  ethBalance: BigNumber | null;
  tokenBalance: BigNumber | null;
  ethReserve: BigNumber | null;
  tokenReserve: BigNumber | null;
  totalLiquidity: BigNumber | null;
  userLpBalance: BigNumber | null;
  isLoading: boolean;
  isLoadingBalances: boolean;
  isLoadingPool: boolean;
  lastSwapResult: DecryptedResult | null;
  lastSwapError: Error | null;
}

interface DexActions {
  refreshBalances: () => Promise<void>;
  refreshPoolState: () => Promise<void>;
  swap: (amount: number, inputAsset: 'ETH' | 'TOKEN') => Promise<void>;
  swapEthForToken: (amount: string) => Promise<string>;
  swapTokenForEth: (amount: string) => Promise<string>;
  addLiquidity: (ethAmount: string, tokenAmount: string) => Promise<string>;
  removeLiquidity: (lpAmount: string) => Promise<string>;
  initialize: (signer: ethers.Signer) => Promise<void>;
}

interface UseDexReturn extends DexState, DexActions {
  isInitialized: boolean;
  provider: ethers.providers.Provider | null;
  contract: Contract | null;
  tokenContract: Contract | null;
}

/**
 * Hook for interacting with FHEDEX contract
 */
export function useDEX(config?: Partial<DexConfig>): UseDexReturn {
  // Import defaults from constants
  const { DEX_CONTRACT_ADDRESS, ZAMA_TOKEN_ADDRESS, DEX_ABI_OBJ, ZAMA_TOKEN_ABI_OBJ, NETWORK_ID } = require('../constants');
  
  // Merge with defaults
  const finalConfig: DexConfig = {
    contractAddress: config?.contractAddress || DEX_CONTRACT_ADDRESS,
    tokenAddress: config?.tokenAddress || ZAMA_TOKEN_ADDRESS,
    contractAbi: config?.contractAbi || DEX_ABI_OBJ,
    tokenAbi: config?.tokenAbi || ZAMA_TOKEN_ABI_OBJ,
    chainId: config?.chainId || NETWORK_ID,
    relayerEndpoint: config?.relayerEndpoint,
  };
  // Refs
  const signerRef = useRef<ethers.Signer | null>(null);
  const providerRef = useRef<ethers.providers.Provider | null>(null);
  const contractRef = useRef<Contract | null>(null);
  const tokenContractRef = useRef<Contract | null>(null);
  const relayerRef = useRef<RelayerClient | null>(null);
  const encryptionRef = useRef<EncryptionService | null>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [ethBalance, setEthBalance] = useState<BigNumber | null>(null);
  const [tokenBalance, setTokenBalance] = useState<BigNumber | null>(null);
  const [ethReserve, setEthReserve] = useState<BigNumber | null>(null);
  const [tokenReserve, setTokenReserve] = useState<BigNumber | null>(null);
  const [totalLiquidity, setTotalLiquidity] = useState<BigNumber | null>(null);
  const [userLpBalance, setUserLpBalance] = useState<BigNumber | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalances, setIsLoadingBalances] = useState(false);
  const [isLoadingPool, setIsLoadingPool] = useState(false);
  const [lastSwapResult, setLastSwapResult] = useState<DecryptedResult | null>(null);
  const [lastSwapError, setLastSwapError] = useState<Error | null>(null);

  /**
   * Initialize DEX with signer
   */
  const initialize = useCallback(
    async (signer: ethers.Signer) => {
      try {
        console.log('[useDEX] Initializing...');

        signerRef.current = signer;
        providerRef.current = signer.provider!;

        // Initialize contracts
        contractRef.current = new Contract(finalConfig.contractAddress, finalConfig.contractAbi, signer);
        tokenContractRef.current = new Contract(finalConfig.tokenAddress, finalConfig.tokenAbi, signer);

        // Initialize services
        relayerRef.current = new RelayerClient({
          endpoint: finalConfig.relayerEndpoint || 'https://testnet-relayer.zama.ai',
          chainId: finalConfig.chainId || 8008,
          enableLogging: true,
        });

        encryptionRef.current = new EncryptionService({
          contractAddress: finalConfig.contractAddress,
          contractAbi: finalConfig.contractAbi,
          enableLogging: true,
        });

        setIsInitialized(true);
        console.log('[useDEX] Initialization complete');

        // Load initial data
        await refreshBalances();
        await refreshPoolState();
      } catch (error) {
        console.error('[useDEX] Initialization failed:', error);
        throw error;
      }
    },
    [config]
  );

  /**
   * Refresh user balances
   */
  const refreshBalances = useCallback(async () => {
    if (!isInitialized || !signerRef.current) return;

    setIsLoadingBalances(true);
    try {
      const address = await signerRef.current.getAddress();

      // Get ETH balance
      const ethBal = await providerRef.current!.getBalance(address);
      setEthBalance(ethBal);

      // Get token balance
      const tokenBal = await tokenContractRef.current!.balanceOf(address);
      setTokenBalance(tokenBal);

      // Get LP balance
      const lpBal = await contractRef.current!.getLPBalance(address);
      setUserLpBalance(lpBal);

      console.log('[useDEX] Balances refreshed', {
        eth: ethBal.toString(),
        token: tokenBal.toString(),
      });
    } catch (error) {
      console.error('[useDEX] Failed to refresh balances:', error);
    } finally {
      setIsLoadingBalances(false);
    }
  }, [isInitialized]);

  /**
   * Refresh pool state
   */
  const refreshPoolState = useCallback(async () => {
    if (!isInitialized || !contractRef.current) return;

    setIsLoadingPool(true);
    try {
      // Get reserves
      const reserves = await contractRef.current.getPoolReserves();
      setEthReserve(BigNumber.from(reserves.ethBalance));
      setTokenReserve(BigNumber.from(reserves.tokenBalance));

      // Get total liquidity
      const totalLiq = await contractRef.current.getTotalLiquidity();
      setTotalLiquidity(totalLiq);

      console.log('[useDEX] Pool state refreshed', {
        ethReserve: reserves.ethBalance.toString(),
        tokenReserve: reserves.tokenBalance.toString(),
      });
    } catch (error) {
      console.error('[useDEX] Failed to refresh pool state:', error);
    } finally {
      setIsLoadingPool(false);
    }
  }, [isInitialized]);

  /**
   * Swap ETH for tokens with Oracle callback
   */
  const swapEthForToken = useCallback(
    async (ethAmount: string) => {
      if (!isInitialized || !contractRef.current || !relayerRef.current) {
        throw new Error('DEX not initialized');
      }

      setIsLoading(true);
      try {
        const bnAmount = ethers.utils.parseEther(ethAmount);
        const userAddress = await signerRef.current!.getAddress();

        console.log('[useDEX] Swapping ETH for token', { amount: ethAmount, user: userAddress });

        // Step 1: Submit swap through contract
        const tx = await contractRef.current.swapEthForToken({ value: bnAmount });
        console.log('[useDEX] Swap transaction sent', { txHash: tx.hash });

        // Step 2: Wait for transaction confirmation to get requestId from event
        const receipt = await tx.wait();
        console.log('[useDEX] Swap confirmed');

        // Step 3: Parse SwapRequested event to get requestId
        let requestId: number | null = null;
        if (receipt.events) {
          for (const event of receipt.events) {
            if (event.eventSignature === 'SwapRequested(address,string,uint256,uint256)') {
              requestId = event.args?.requestId?.toNumber?.() || null;
              break;
            }
          }
        }

        if (!requestId) {
          throw new Error('Failed to get requestId from SwapRequested event');
        }

        console.log('[useDEX] Got requestId from event', { requestId });

        // Step 5: Encrypt amount and request Oracle decryption
        const encryptedAmount = await encryptionRef.current!.encryptAmount(bnAmount);
        await relayerRef.current.requestOracleDecryption(
          requestId,
          encryptedAmount.value, // Pass the hex string, not the object
          finalConfig.contractAddress
        );

        console.log('[useDEX] Oracle decryption requested', { requestId });

        // Step 5: Wait for Oracle callback to complete the swap
        const callbackStatus = await relayerRef.current.waitForOracleCallback(
          requestId,
          5 * 60 * 1000, // 5 minute timeout
          (status) => {
            console.log('[useDEX] Callback progress', { status: status.status });
          }
        );

        console.log('[useDEX] Swap completed via callback', { requestId, status: callbackStatus.status });

        // Step 6: Refresh balances
        await refreshBalances();
        await refreshPoolState();

        setLastSwapResult({
          txHash: tx.hash,
          outputAmount: callbackStatus.result || '0',
          status: 'completed',
        });

        return tx.hash;
      } catch (error) {
        console.error('[useDEX] Swap failed:', error);
        setLastSwapError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized, finalConfig.contractAddress, refreshBalances, refreshPoolState]
  );

  /**
   * Swap tokens for ETH with Oracle callback
   */
  const swapTokenForEth = useCallback(
    async (tokenAmount: string) => {
      if (!isInitialized || !contractRef.current || !relayerRef.current) {
        throw new Error('DEX not initialized');
      }

      setIsLoading(true);
      try {
        const bnAmount = ethers.utils.parseUnits(tokenAmount, 18); // Assuming 18 decimals
        const userAddress = await signerRef.current!.getAddress();

        console.log('[useDEX] Swapping token for ETH', { amount: tokenAmount, user: userAddress });

        // Step 1: Approve token transfer
        await tokenContractRef.current!.approve(finalConfig.contractAddress, bnAmount);
        console.log('[useDEX] Token transfer approved');

        // Step 2: Submit swap through contract
        const tx = await contractRef.current.swapTokenForEth(bnAmount);
        console.log('[useDEX] Swap transaction sent', { txHash: tx.hash });

        // Step 3: Wait for transaction confirmation to get requestId from event
        const receipt = await tx.wait();
        console.log('[useDEX] Swap confirmed');

        // Step 4: Parse SwapRequested event to get requestId
        let requestId: number | null = null;
        if (receipt.events) {
          for (const event of receipt.events) {
            if (event.eventSignature === 'SwapRequested(address,string,uint256,uint256)') {
              requestId = event.args?.requestId?.toNumber?.() || null;
              break;
            }
          }
        }

        if (!requestId) {
          throw new Error('Failed to get requestId from SwapRequested event');
        }

        console.log('[useDEX] Got requestId from event', { requestId });

        // Step 5: Encrypt amount and request Oracle decryption
        const encryptedAmount = await encryptionRef.current!.encryptAmount(bnAmount);
        await relayerRef.current.requestOracleDecryption(
          requestId,
          encryptedAmount.value, // Pass the hex string, not the object
          finalConfig.contractAddress
        );

        console.log('[useDEX] Oracle decryption requested', { requestId });

        // Step 6: Wait for Oracle callback to complete the swap
        const callbackStatus = await relayerRef.current.waitForOracleCallback(
          requestId,
          5 * 60 * 1000, // 5 minute timeout
          (status) => {
            console.log('[useDEX] Callback progress', { status: status.status });
          }
        );

        console.log('[useDEX] Swap completed via callback', { requestId, status: callbackStatus.status });

        // Step 7: Refresh balances
        await refreshBalances();
        await refreshPoolState();

        setLastSwapResult({
          txHash: tx.hash,
          outputAmount: callbackStatus.result || '0',
          status: 'completed',
        });

        return tx.hash;
      } catch (error) {
        console.error('[useDEX] Swap failed:', error);
        setLastSwapError(error instanceof Error ? error : new Error(String(error)));
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized, finalConfig.contractAddress, refreshBalances, refreshPoolState]
  );

  /**
   * Add liquidity
   */
  const addLiquidity = useCallback(
    async (ethAmount: string, tokenAmount: string) => {
      if (!isInitialized || !contractRef.current) {
        throw new Error('DEX not initialized');
      }

      setIsLoading(true);
      try {
        const ethBn = ethers.utils.parseEther(ethAmount);
        const tokenBn = ethers.utils.parseUnits(tokenAmount, 18);

        console.log('[useDEX] Adding liquidity', { ethAmount, tokenAmount });

        // First, approve token transfer
        await tokenContractRef.current!.approve(finalConfig.contractAddress, tokenBn);

        // Then call addLiquidity with ETH
        const tx = await contractRef.current.addLiquidity(tokenBn, { value: ethBn });
        const receipt = await tx.wait();

        console.log('[useDEX] Liquidity added', { txHash: receipt.transactionHash });

        await refreshBalances();
        await refreshPoolState();

        return receipt.transactionHash;
      } catch (error) {
        console.error('[useDEX] Failed to add liquidity:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized, config, refreshBalances, refreshPoolState]
  );

  /**
   * Remove liquidity
   */
  const removeLiquidity = useCallback(
    async (lpAmount: string) => {
      if (!isInitialized || !contractRef.current) {
        throw new Error('DEX not initialized');
      }

      setIsLoading(true);
      try {
        const lpBn = ethers.utils.parseUnits(lpAmount, 18);

        console.log('[useDEX] Removing liquidity', { lpAmount });

        const tx = await contractRef.current.removeLiquidity(lpBn);
        const receipt = await tx.wait();

        console.log('[useDEX] Liquidity removed', { txHash: receipt.transactionHash });

        await refreshBalances();
        await refreshPoolState();

        return receipt.transactionHash;
      } catch (error) {
        console.error('[useDEX] Failed to remove liquidity:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [isInitialized, refreshBalances, refreshPoolState]
  );

  /**
   * Generic swap function - routes to appropriate swap method based on asset direction
   */
  const swap = useCallback(
    async (amount: number, inputAsset: 'ETH' | 'TOKEN') => {
      if (inputAsset === 'ETH') {
        await swapEthForToken(amount.toString());
      } else {
        await swapTokenForEth(amount.toString());
      }
    },
    [swapEthForToken, swapTokenForEth]
  );

  // Return state and actions
  return {
    // State
    isInitialized,
    ethBalance,
    tokenBalance,
    ethReserve,
    tokenReserve,
    totalLiquidity,
    userLpBalance,
    isLoading,
    isLoadingBalances,
    isLoadingPool,
    lastSwapResult,
    lastSwapError,
    provider: providerRef.current,
    contract: contractRef.current,
    tokenContract: tokenContractRef.current,

    // Actions
    initialize,
    refreshBalances,
    refreshPoolState,
    swap,
    swapEthForToken,
    swapTokenForEth,
    addLiquidity,
    removeLiquidity,
  };
}
