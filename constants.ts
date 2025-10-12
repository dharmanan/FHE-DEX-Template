export const TOKEN_NAME = "Zama";
export const TOKEN_SYMBOL = "ZAMA";

export const ZAMA_TOKEN_ADDRESS = "0x14d3f35e428Af778D64c98D8C80Ed37D6D1208bF";
export const DEX_CONTRACT_ADDRESS = "0x051B0a61749320F6635dA04bc25319B0d0e0FF00";

import DEX_ABI from "./src/abi/DEX.json";
import ZAMA_TOKEN_ABI from "./src/abi/ZamaToken.json";
export const DEX_ABI_OBJ = DEX_ABI;
export const ZAMA_TOKEN_ABI_OBJ = ZAMA_TOKEN_ABI;

export const INITIAL_ETH_RESERVE = 50;
export const INITIAL_TOKEN_RESERVE = 5000;

export const INITIAL_USER_ETH_BALANCE = 10;
export const INITIAL_USER_TOKEN_BALANCE = 1000;

export const MOCK_API_DELAY = 1500; // ms