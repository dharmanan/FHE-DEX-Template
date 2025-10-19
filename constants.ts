export const TOKEN_NAME = "Zama";
export const TOKEN_SYMBOL = "ZAMA";

// Sepolia Testnet Deployed Contracts (October 19, 2025 - Immediate AMM Model)
// FHE-Enabled FHEDEX Contract with Immediate Swap Execution
// Pool: 0.5 ETH + 5000 ZAMA
export const DEX_CONTRACT_ADDRESS = import.meta.env.VITE_DEX_ADDRESS || "0x42972a46781C41AB51b82B6BF425c9483BeC25e3";
export const ZAMA_TOKEN_ADDRESS = import.meta.env.VITE_ZAMA_TOKEN_ADDRESS || "0x6d37e043a8e985b1CdDCb6E07dD0c5dA1306FbF3";

import DEX_ABI from "./src/abi/DEX.json";
import ZAMA_TOKEN_ABI from "./src/abi/ZamaToken.json";
export const DEX_ABI_OBJ = DEX_ABI;
export const ZAMA_TOKEN_ABI_OBJ = ZAMA_TOKEN_ABI;

export const INITIAL_ETH_RESERVE = 50;
export const INITIAL_TOKEN_RESERVE = 5000;

export const INITIAL_USER_ETH_BALANCE = 10;
export const INITIAL_USER_TOKEN_BALANCE = 1000;

export const MOCK_API_DELAY = 1500; // ms

// Network Configuration
export const NETWORK_ID = parseInt(import.meta.env.VITE_NETWORK_ID || "11155111"); // Sepolia
export const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME || "sepolia";