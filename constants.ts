export const TOKEN_NAME = "Zama";
export const TOKEN_SYMBOL = "ZAMA";

// Sepolia Testnet Deployed Contracts (October 18, 2025 - Updated)
export const ZAMA_TOKEN_ADDRESS = process.env.VITE_ZAMA_TOKEN_ADDRESS || "0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636";
export const DEX_CONTRACT_ADDRESS = process.env.VITE_DEX_ADDRESS || "0x1F1B2d3BDCe3674164eD34F1313a62486764CD19";

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