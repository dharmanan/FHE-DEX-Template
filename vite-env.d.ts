/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEX_ADDRESS: string;
  readonly VITE_ZAMA_TOKEN_ADDRESS: string;
  readonly VITE_NETWORK_ID: string;
  readonly VITE_NETWORK_NAME: string;
  readonly VITE_RPC_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
