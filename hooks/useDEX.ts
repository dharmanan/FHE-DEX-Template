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
  const [chainId, setChainId] = useState<number | null>(null);
  const simulatedWallet = new ethers.Wallet(SIMULATED_WALLET_PRIVATE_KEY);

  const connectWallet = useCallback(async () => {
    if ((window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        
        // Try to request permissions to allow wallet switching
        try {
          await ethereum.request({
            method: 'wallet_requestPermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (permError) {
          // If wallet_requestPermissions fails, try wallet_addEthereumChain or just proceed
          console.log("wallet_requestPermissions not supported, proceeding with eth_requestAccounts");
        }

        const browserProvider = new ethers.providers.Web3Provider(ethereum);
        const accounts = await browserProvider.send("eth_requestAccounts", []);
        console.log("Connected accounts:", accounts);
        
        const userSigner = browserProvider.getSigner();
        const address = await userSigner.getAddress();
        const network = await browserProvider.getNetwork();
        
        setProvider(browserProvider);
        setSigner(userSigner);
        setUserAddress(address);
        setChainId(network.chainId);
        console.log("Wallet connected:", address, "Chain:", network.chainId);
      } catch (error) {
        console.error("Cüzdan bağlantısı başarısız", error);
        alert("Cüzdan bağlanamadı.");
      }
    } else {
      alert("Lütfen MetaMask kurun!");
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setUserAddress(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
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
          const tx = await dexContract.swapEth({ value: ethers.utils.parseEther(inputAmount.toString()) });
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
        // Token ile swap için önce approve, sonra swapToken fonksiyonu çağrılmalı
        try {
          const tokenContract = new ethers.Contract(ZAMA_TOKEN_ADDRESS, ZAMA_TOKEN_ABI_OBJ, signer);
          const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, signer);
          
          // Check current allowance
          const currentAllowance = await tokenContract.allowance(userAddress, DEX_CONTRACT_ADDRESS);
          const requiredAmount = ethers.utils.parseUnits(inputAmount.toString(), 18);
          
          // Approve if needed
          if (currentAllowance.lt(requiredAmount)) {
            console.log("📝 Approving tokens for swap...");
            const approveTx = await tokenContract.approve(DEX_CONTRACT_ADDRESS, requiredAmount);
            await approveTx.wait();
            console.log("✅ Approval confirmed");
          }
          
          // Swap işlemi with gas limit
          console.log("🔄 Executing token-to-ETH swap...");
          const swapTx = await dexContract.swapToken(
            requiredAmount,
            { gasLimit: 500000 }
          );
          await swapTx.wait();
          console.log("✅ Swap completed");
          
          // Zincirden bakiyeleri güncelle
          await new Promise(resolve => setTimeout(resolve, 1000));
          await refreshOnChainBalances();
        } catch (err) {
          console.error("Swap error:", err);
          alert("Swap işlemi başarısız: " + (err instanceof Error ? err.message : String(err)));
          return;
        }
      } else {
        await handleTransaction({ type: 'swap', inputAsset: TOKEN_SYMBOL, inputAmount, outputAsset: 'ETH', outputAmount });
      }
    }
  }, [handleTransaction, userEthBalance, userTokenBalance, ethReserve, tokenReserve, isLiveMode, signer, provider, refreshOnChainBalances]);

  const deposit = useCallback(async (ethAmount: number) => {
    console.log("🔄 Deposit function called with ETH amount:", ethAmount);
    console.log("📊 Current state:", { userEthBalance, userTokenBalance, ethReserve, tokenReserve });
    
    if (ethAmount > userEthBalance) { alert("Insufficient ETH balance."); return; }
    const tokenAmount = (ethAmount / ethReserve) * tokenReserve;
    console.log("💰 Calculated token amount needed:", tokenAmount);
    
    // Add 2% buffer for rounding differences
    const tokenAmountWithBuffer = tokenAmount * 1.02;
    console.log("💰 Token amount with 2% buffer:", tokenAmountWithBuffer);
    
    if (tokenAmountWithBuffer > userTokenBalance) { alert(`Insufficient ${TOKEN_SYMBOL} balance.`); return; }

    if (isLiveMode && signer && provider) {
      try {
        console.log("🚀 Starting live deposit transaction...");
        const tokenContract = new ethers.Contract(ZAMA_TOKEN_ADDRESS, ZAMA_TOKEN_ABI_OBJ, signer);
        const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, signer);
        
        console.log("📋 Contract addresses:", { ZAMA_TOKEN_ADDRESS, DEX_CONTRACT_ADDRESS });
        console.log("👤 User address:", userAddress);
        
        // Step 1: Check current allowance
        const currentAllowance = await tokenContract.allowance(userAddress, DEX_CONTRACT_ADDRESS);
        const requiredAmount = ethers.utils.parseUnits(tokenAmountWithBuffer.toString(), 18);
        
        console.log("✅ Allowance check:", {
          currentAllowance: currentAllowance.toString(),
          requiredAmount: requiredAmount.toString(),
          needsApproval: currentAllowance.lt(requiredAmount)
        });
        
        // Step 2: Approve if needed (with extra buffer)
        if (currentAllowance.lt(requiredAmount)) {
          console.log("📝 Approving tokens...");
          const approveTx = await tokenContract.approve(
            DEX_CONTRACT_ADDRESS,
            ethers.utils.parseUnits((tokenAmountWithBuffer * 1.1).toString(), 18) // 10% buffer
          );
          console.log("⏳ Waiting for approval transaction...");
          const approveReceipt = await approveTx.wait();
          console.log("✅ Approval confirmed:", approveReceipt?.transactionHash);
        } else {
          console.log("✅ Already approved, skipping approval");
        }
        
        // Step 3: Deposit with proper gas handling
        console.log("💰 Adding liquidity with params:", {
          ethAmount: ethAmount.toString(),
          tokenAmount: tokenAmount.toString(),
          tokenAmountWithBuffer: tokenAmountWithBuffer.toString(),
          requiredAmount: requiredAmount.toString(),
          ethValue: ethers.utils.parseEther(ethAmount.toString()).toString()
        });
        
        const depositTx = await dexContract.deposit(
          requiredAmount,
          { 
            value: ethers.utils.parseEther(ethAmount.toString()),
            gasLimit: 700000 // Increased gas limit
          }
        );
        console.log("⏳ Waiting for deposit transaction...");
        const depositReceipt = await depositTx.wait();
        console.log("✅ Liquidity added TX:", depositReceipt?.transactionHash);
        
        // Step 4: Refresh balances
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshOnChainBalances();
      } catch (err) {
        console.error("❌ Deposit error full object:", err);
        console.error("Error message:", err instanceof Error ? err.message : String(err));
        
        // Try to get more details
        if (err && typeof err === 'object') {
          console.error("Error data:", {
            code: (err as any).code,
            reason: (err as any).reason,
            method: (err as any).method,
            transaction: (err as any).transaction,
            receipt: (err as any).receipt
          });
        }
        
        const errorMsg = err instanceof Error ? err.message : String(err);
        alert("Likidite ekleme başarısız: " + errorMsg);
        return;
      }
    } else {
      await handleTransaction({ type: 'deposit', inputAsset: 'ETH', inputAmount: ethAmount, outputAsset: TOKEN_SYMBOL, outputAmount: tokenAmount });
    }
  }, [handleTransaction, userEthBalance, userTokenBalance, ethReserve, tokenReserve, isLiveMode, signer, provider, userAddress, refreshOnChainBalances]);

  const withdraw = useCallback(async (lpAmount: number) => {
    if (lpAmount > userLiquidity) { alert("Insufficient liquidity tokens."); return; }
    const ownershipRatio = lpAmount / totalLiquidity;
    const ethToWithdraw = ownershipRatio * ethReserve;
    const tokenToWithdraw = ownershipRatio * tokenReserve;

    if (isLiveMode && signer && provider) {
      try {
        const dexContract = new ethers.Contract(DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ, signer);
        
        // Withdraw with explicit gas limit
        console.log("🔄 Withdrawing liquidity...");
        const withdrawTx = await dexContract.withdraw(
          ethers.utils.parseEther(lpAmount.toString()),
          { gasLimit: 500000 }
        );
        const withdrawReceipt = await withdrawTx.wait();
        console.log("✅ Withdrawal completed TX:", withdrawReceipt?.transactionHash);
        
        // Refresh balances with delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        await refreshOnChainBalances();
      } catch (err) {
        console.error("Withdraw error:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);
        alert("Withdraw işlemi başarısız: " + errorMsg);
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
    chainId,
    setIsLiveMode,
    swap,
    deposit,
    withdraw,
    clearTransactionSummary,
    connectWallet,
    disconnectWallet,
  };
};