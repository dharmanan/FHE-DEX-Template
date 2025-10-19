export const TOKEN_NAME = "Zama";
export const TOKEN_SYMBOL = "ZAMA";

// Sepolia Testnet Deployed Contracts (October 19, 2025 - FIXED TOKEN WITHDRAW)
// FHE-Enabled FHEDEX Contract with Immediate Swap + FIXED removeLiquidity returns both ETH and TOKEN
// Pool: 0.05 ETH + 500 ZAMA (fixed zamaToken → token variable names)
export const DEX_CONTRACT_ADDRESS = import.meta.env.VITE_DEX_ADDRESS || "0x52e1F9F6F9d51F5640A221061d3ACf5FEa3398Be";
export const ZAMA_TOKEN_ADDRESS = import.meta.env.VITE_ZAMA_TOKEN_ADDRESS || "0x3630d67C78A3da51549e8608C17883Ea481D817F";

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