
// React hooks/adapters for FHEVM SDK
import { useState, useCallback } from 'react';
import { FhevmSDK, FhevmConfig } from './core';

/**
 * React hook to create and memoize an FHEVM SDK instance
 * @param config FhevmConfig
 */
export function useFhevm(config: FhevmConfig) {
  const [sdk] = useState(() => new FhevmSDK(config));
  return sdk;
}

/**
 * React hook to encrypt an input value using FHEVM SDK
 * @param sdk FhevmSDK instance
 * @param input Value to encrypt
 */
export function useEncryptedInput(sdk: FhevmSDK, input: any) {
  const [encrypted, setEncrypted] = useState<string | null>(null);
  const encrypt = useCallback(async () => {
    const result = await sdk.encrypt(input);
    setEncrypted(result);
  }, [sdk, input]);
  return { encrypted, encrypt };
}

/**
 * React hook to decrypt an encrypted value using FHEVM SDK
 * @param sdk FhevmSDK instance
 * @param encrypted Encrypted value
 */
export function useDecryption(sdk: FhevmSDK, encrypted: string) {
  const [decrypted, setDecrypted] = useState<any>(null);
  const decrypt = useCallback(async () => {
    const result = await sdk.decrypt(encrypted);
    setDecrypted(result);
  }, [sdk, encrypted]);
  return { decrypted, decrypt };
}
