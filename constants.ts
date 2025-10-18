export const TOKEN_NAME = "Zama";
export const TOKEN_SYMBOL = "ZAMA";

// Sepolia Testnet Deployed Contracts (October 18, 2025)
export const ZAMA_TOKEN_ADDRESS = process.env.VITE_ZAMA_TOKEN_ADDRESS || "0xb2B26a1222D5c02a081cBDC06277D71BD50927e6";
export const DEX_CONTRACT_ADDRESS = process.env.VITE_DEX_ADDRESS || "0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c";

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
export const NETWORK_ID = parseInt(process.env.VITE_NETWORK_ID || "11155111"); // Sepolia
export const NETWORK_NAME = process.env.VITE_NETWORK_NAME || "sepolia";