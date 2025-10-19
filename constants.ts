export const TOKEN_NAME = "Zama";
export const TOKEN_SYMBOL = "ZAMA";

// Sepolia Testnet Deployed Contracts (October 19, 2025 - Final)
// FHE-Enabled FHEDEX Contract with Immediate Swap + Fixed LP Calculation
// Pool: 1 ETH + 10000 ZAMA (recovered from old contracts)
export const DEX_CONTRACT_ADDRESS = import.meta.env.VITE_DEX_ADDRESS || "0xc7a8884fa733510A3A1C7021e38Dd053dDb75e41";
export const ZAMA_TOKEN_ADDRESS = import.meta.env.VITE_ZAMA_TOKEN_ADDRESS || "0x2080Db70a9490Eb7E3d7C5ebD58C36F58CE908A1";

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