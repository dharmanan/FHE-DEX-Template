export type TransactionType = 'swap' | 'deposit' | 'withdraw';

export interface TransactionDetails {
  type: TransactionType;
  inputAsset: string;
  inputAmount: number;
  outputAsset: string;
  outputAmount: number;
}

export interface UseDEXReturnType {
  ethReserve: number;
  tokenReserve: number;
  userEthBalance: number;
  userTokenBalance: number;
  userLiquidity: number;
  totalLiquidity: number;
  isLoading: boolean;
  isSummaryLoading: boolean;
  isLiveMode: boolean;
  transactionSummary: string | null;
  TOKEN_SYMBOL: string;
  TOKEN_NAME: string;
  userAddress: string | null;
  chainId: number | null;
  setIsLiveMode: (isLive: boolean) => void;
  swap: (inputAmount: number, inputAsset: 'ETH' | 'TOKEN') => Promise<void>;
  deposit: (ethAmount: number) => Promise<void>;
  withdraw: (lpAmount: number) => Promise<void>;
  clearTransactionSummary: () => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}