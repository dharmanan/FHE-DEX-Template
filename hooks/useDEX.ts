import { useState, useCallback, useEffect } from 'react';
import type { providers, Signer } from 'ethers';
import { ethers } from 'ethers';
import type { UseDEXReturnType, TransactionDetails } from '../types';
import { FhevmService } from '../services/fhevmService';
import { GeminiService } from '../services/geminiService';
import { 
  TOKEN_NAME, 
  TOKEN_SYMBOL, 
  INITIAL_ETH_RESERVE, 
  INITIAL_TOKEN_RESERVE, 
  INITIAL_USER_ETH_BALANCE, 
  INITIAL_USER_TOKEN_BALANCE,
  MOCK_API_DELAY,
  DEX_CONTRACT_ADDRESS,
  DEX_ABI_OBJ,
  ZAMA_TOKEN_ADDRESS,
  ZAMA_TOKEN_ABI_OBJ
} from '../constants';

const SIMULATED_WALLET_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export const useDEX = (): UseDEXReturnType => {
  const [ethReserve, setEthReserve] = useState(INITIAL_ETH_RESERVE);
  const [tokenReserve, setTokenReserve] = useState(INITIAL_TOKEN_RESERVE);
  const [totalLiquidity, setTotalLiquidity] = useState(Math.sqrt(INITIAL_ETH_RESERVE * INITIAL_TOKEN_RESERVE));
  
  const [userEthBalance, setUserEthBalance] = useState(INITIAL_USER_ETH_BALANCE);
  const [userTokenBalance, setUserTokenBalance] = useState(INITIAL_USER_TOKEN_BALANCE);
  const [userLiquidity, setUserLiquidity] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [transactionSummary, setTransactionSummary] = useState<string | null>(null);

  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<providers.Web3Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);
  const simulatedWallet = new ethers.Wallet(SIMULATED_WALLET_PRIVATE_KEY);

  const connectWallet = useCallback(async () => {
    if ((window as any).ethereum) {
      try {
        const browserProvider = new ethers.providers.Web3Provider((window as any).ethereum);
        await browserProvider.send("eth_requestAccounts", []);
        const userSigner = browserProvider.getSigner();
        const address = await userSigner.getAddress();
        setProvider(browserProvider);
        setSigner(userSigner);
        setUserAddress(address);
      } catch (error) {
        console.error("Cüzdan bağlantısı başarısız", error);
        alert("Cüzdan bağlanamadı.");
      }
    } else {
      alert("Lütfen MetaMask kurun!");
    }
  }, []);

  const fhevmService = new FhevmService(isLiveMode);
  const geminiService = new GeminiService();
  
  // --- MODE CHANGE EFFECT ---
  useEffect(() => {
    if (isLiveMode) {
      connectWallet();
    } else {
      setUserAddress(simulatedWallet.address);
      setProvider(null);
      setSigner(null);
    }
    setEthReserve(INITIAL_ETH_RESERVE);
    setTokenReserve(INITIAL_TOKEN_RESERVE);
    setUserEthBalance(INITIAL_USER_ETH_BALANCE);
    setUserTokenBalance(INITIAL_USER_TOKEN_BALANCE);
    setUserLiquidity(0);
  }, [isLiveMode, connectWallet, simulatedWallet.address]);

  useEffect(() => {
    if (isLiveMode && provider && signer && userAddress) {
      refreshOnChainBalances();
    }
  }, [isLiveMode, provider, signer, userAddress]);

  const handleTransaction = useCallback(async (details: TransactionDetails) => {
    setIsLoading(true);
    setIsSummaryLoading(true);
    setTransactionSummary(null);

    const geminiPromise = geminiService.generateTransactionSummary(details);

    try {
      if (isLiveMode) {
        await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY));
      }
      const transactionResult = await fhevmService.executeConfidentialTransaction(details);
      if (!transactionResult.success && !isLiveMode) {
        throw new Error(transactionResult.error || "Transaction failed");
      }
      if (details.type === 'swap') {
        const fee = details.inputAmount * 0.003;
        const inputAmountAfterFee = details.inputAmount - fee;
        if (details.inputAsset === 'ETH') {
          setUserEthBalance((b: number) => b - details.inputAmount);
          setUserTokenBalance((b: number) => b + details.outputAmount);
          setEthReserve((r: number) => r + inputAmountAfterFee);
          setTokenReserve((r: number) => r - details.outputAmount);
        } else {
          setUserTokenBalance((b: number) => b - details.inputAmount);
          setUserEthBalance((b: number) => b + details.outputAmount);
          setTokenReserve((r: number) => r + inputAmountAfterFee);
          setEthReserve((r: number) => r - details.outputAmount);
        }
      } else if (details.type === 'deposit') {
        const lpTokensMinted = (details.inputAmount / ethReserve) * totalLiquidity;
        setUserEthBalance((b: number) => b - details.inputAmount);
        setUserTokenBalance((b: number) => b - details.outputAmount);
        setEthReserve((r: number) => r + details.inputAmount);
        setTokenReserve((r: number) => r + details.outputAmount);
        setUserLiquidity((l: number) => l + lpTokensMinted);
        setTotalLiquidity((t: number) => t + lpTokensMinted);
      } else if (details.type === 'withdraw') {
        const ownershipRatio = details.inputAmount / totalLiquidity;
        const ethWithdrawn = ownershipRatio * ethReserve;
        const tokenWithdrawn = ownershipRatio * tokenReserve;
        setUserLiquidity((l: number) => l - details.inputAmount);
        setTotalLiquidity((t: number) => t - details.inputAmount);
        setEthReserve((r: number) => r - ethWithdrawn);
        setTokenReserve((r: number) => r - tokenWithdrawn);
        setUserEthBalance((b: number) => b + ethWithdrawn);
        setUserTokenBalance((b: number) => b + tokenWithdrawn);
      }
      const summary = await geminiPromise;
      setTransactionSummary(summary);
    } catch (error) {
      console.error("Transaction Error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setTransactionSummary(`## Transaction Failed 🚨\n\nUnfortunately, the transaction could not be completed.\n\n**Reason:** ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsSummaryLoading(false);
    }
  }, [isLiveMode, ethReserve, tokenReserve, totalLiquidity, fhevmService, geminiService]);

  const refreshOnChainBalances = useCallback(async () => {
    if (!provider || !signer || !userAddress) return;
    try {
      const ethBal = await provider.getBalance(userAddress);
      setUserEthBalance(Number(ethers.utils.formatEther(ethBal)));

      const tokenContract = new ethers.Contract(ZAMA_TOKEN_ADDRESS, ZAMA_TOKEN_ABI_OBJ, provider);
      const tokenBal = await tokenContract.balanceOf(userAddress);
      setUserTokenBalance(Number(ethers.utils.formatUnits(tokenBal, 18)));

      const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, provider);
      const reserves = await dexContract.getReserves();
      setEthReserve(Number(ethers.utils.formatEther(reserves[0])));
      setTokenReserve(Number(ethers.utils.formatUnits(reserves[1], 18)));
      const userLiquidityOnChain = await dexContract.liquidity(userAddress);
      setUserLiquidity(Number(ethers.utils.formatEther(userLiquidityOnChain)));
      
      console.log("✅ Balances refreshed from chain");
    } catch (err) {
      console.error("Zincirden bakiyeler okunamadı:", err);
    }
  }, [provider, signer, userAddress]);

  const swap = useCallback(async (inputAmount: number, inputAsset: 'ETH' | 'TOKEN') => {
    const k = ethReserve * tokenReserve;
    let outputAmount = 0;

    if (inputAsset === 'ETH') {
      if (inputAmount > userEthBalance) { alert("Yetersiz ETH bakiyesi."); return; }
      const fee = inputAmount * 0.003;
      const inputAmountWithFee = inputAmount - fee;
      const newEthReserve = ethReserve + inputAmountWithFee;
      const newTokenReserve = k / newEthReserve;
      outputAmount = tokenReserve - newTokenReserve;

      if (isLiveMode && signer && provider) {
        // Gerçek kontrata işlem gönder
        try {
          const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, signer);
          const tx = await dexContract.ethToTokenSwap({ value: ethers.utils.parseEther(inputAmount.toString()) });
          await tx.wait();
          // Zincirden bakiyeleri güncelle
          await refreshOnChainBalances();
        } catch (err) {
          alert("Swap işlemi başarısız: " + (err instanceof Error ? err.message : String(err)));
          return;
        }
      } else {
        await handleTransaction({ type: 'swap', inputAsset: 'ETH', inputAmount, outputAsset: TOKEN_SYMBOL, outputAmount });
      }
    } else {
      if (inputAmount > userTokenBalance) { alert(`Yetersiz ${TOKEN_SYMBOL} bakiyesi.`); return; }
      const fee = inputAmount * 0.003;
      const inputAmountWithFee = inputAmount - fee;
      const newTokenReserve = tokenReserve + inputAmountWithFee;
      const newEthReserve = k / newTokenReserve;
      outputAmount = ethReserve - newEthReserve;

      if (isLiveMode && signer && provider) {
        // Token ile swap için önce approve, sonra tokenToEthSwap fonksiyonu çağrılmalı
        try {
          const tokenContract = new ethers.Contract(ZAMA_TOKEN_ADDRESS, ZAMA_TOKEN_ABI_OBJ, signer);
          const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, signer);
          // Onay ver
          const approveTx = await tokenContract.approve(DEX_CONTRACT_ADDRESS, ethers.utils.parseUnits(inputAmount.toString(), 18));
          await approveTx.wait();
          // Swap işlemi (yeni fonksiyon)
          const swapTx = await dexContract.tokenToEthSwap(ethers.utils.parseUnits(inputAmount.toString(), 18));
          await swapTx.wait();
          // Zincirden bakiyeleri güncelle
          await refreshOnChainBalances();
        } catch (err) {
          alert("Swap işlemi başarısız: " + (err instanceof Error ? err.message : String(err)));
          return;
        }
      } else {
        await handleTransaction({ type: 'swap', inputAsset: TOKEN_SYMBOL, inputAmount, outputAsset: 'ETH', outputAmount });
      }
    }
  }, [handleTransaction, userEthBalance, userTokenBalance, ethReserve, tokenReserve, isLiveMode, signer, provider, refreshOnChainBalances]);

  const deposit = useCallback(async (ethAmount: number) => {
    if (ethAmount > userEthBalance) { alert("Insufficient ETH balance."); return; }
    const tokenAmount = (ethAmount / ethReserve) * tokenReserve;
    if (tokenAmount > userTokenBalance) { alert(`Insufficient ${TOKEN_SYMBOL} balance.`); return; }

    if (isLiveMode && signer && provider) {
      try {
        // Önce approve
        const tokenContract = new ethers.Contract(ZAMA_TOKEN_ADDRESS, ZAMA_TOKEN_ABI_OBJ, signer);
        const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, signer);
        const approveTx = await tokenContract.approve(DEX_CONTRACT_ADDRESS, ethers.utils.parseUnits(tokenAmount.toString(), 18));
        await approveTx.wait();
        // Deposit işlemi
        const depositTx = await dexContract.deposit(ethers.utils.parseUnits(tokenAmount.toString(), 18), { value: ethers.utils.parseEther(ethAmount.toString()) });
        await depositTx.wait();
        await refreshOnChainBalances();
      } catch (err) {
        alert("Likidite ekleme başarısız: " + (err instanceof Error ? err.message : String(err)));
        return;
      }
    } else {
      await handleTransaction({ type: 'deposit', inputAsset: 'ETH', inputAmount: ethAmount, outputAsset: TOKEN_SYMBOL, outputAmount: tokenAmount });
    }
  }, [handleTransaction, userEthBalance, userTokenBalance, ethReserve, tokenReserve, isLiveMode, signer, provider, refreshOnChainBalances]);

  const withdraw = useCallback(async (lpAmount: number) => {
    if (lpAmount > userLiquidity) { alert("Insufficient liquidity tokens."); return; }
    const ownershipRatio = lpAmount / totalLiquidity;
    const ethToWithdraw = ownershipRatio * ethReserve;
    const tokenToWithdraw = ownershipRatio * tokenReserve;

    if (isLiveMode && signer && provider) {
      try {
        const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, signer);
        // Withdraw fonksiyonuna 18 desimal ile gönder
        const withdrawTx = await dexContract.withdraw(ethers.utils.parseEther(lpAmount.toString()));
        await withdrawTx.wait();
        await refreshOnChainBalances();
      } catch (err) {
        alert("Withdraw işlemi başarısız: " + (err instanceof Error ? err.message : String(err)));
        return;
      }
    } else {
      await handleTransaction({ type: 'withdraw', inputAsset: 'LP Tokens', inputAmount: lpAmount, outputAsset: `ETH & ${TOKEN_SYMBOL}`, outputAmount: ethToWithdraw + tokenToWithdraw });
    }
  }, [handleTransaction, userLiquidity, totalLiquidity, ethReserve, tokenReserve, isLiveMode, signer, provider, refreshOnChainBalances]);
  
  const clearTransactionSummary = () => setTransactionSummary(null);

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
    setIsLiveMode,
    swap,
    deposit,
    withdraw,
    clearTransactionSummary,
  };
};