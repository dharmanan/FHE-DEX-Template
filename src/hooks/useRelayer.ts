/**
 * useRelayer Hook
 * Simplified hook for Oracle callback-based swaps
 * Now works directly with RelayerClient for requestOracleDecryption()
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { RelayerClient } from '../services/relayerClient';

interface UseRelayerOptions {
  relayerEndpoint: string;
  chainId: number;
  enableLogging?: boolean;
  onSwapComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

interface UseRelayerState {
  isLoading: boolean;
  error: Error | null;
  pendingSwaps: Map<string, any>;
}

/**
 * Hook for managing relayer communication
 * Returns RelayerClient instance for direct use
 */
export function useRelayer(options: UseRelayerOptions) {
  const relayerClientRef = useRef<RelayerClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pendingSwaps, setPendingSwaps] = useState<Map<string, any>>(new Map());
  const mountedRef = useRef(true);

  // Initialize relayer client
  useEffect(() => {
    relayerClientRef.current = new RelayerClient({
      endpoint: options.relayerEndpoint,
      chainId: options.chainId,
      enableLogging: options.enableLogging ?? false,
    });

    console.log('[useRelayer] Initialized with endpoint:', options.relayerEndpoint);

    return () => {
      mountedRef.current = false;
    };
  }, [options.relayerEndpoint, options.chainId, options.enableLogging]);

  /**
   * Get the initialized RelayerClient
   */
  const getClient = useCallback(() => {
    if (!relayerClientRef.current) {
      throw new Error('RelayerClient not initialized');
    }
    return relayerClientRef.current;
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get pending swaps
   */
  const getPendingSwaps = useCallback(() => {
    return Array.from(pendingSwaps.values());
  }, [pendingSwaps]);

  return {
    // State
    isLoading,
    error,
    pendingSwaps,

    // Actions
    getClient,
    clearError,
    getPendingSwaps,

    // Direct reference for advanced usage
    relayerClient: relayerClientRef.current,
  };
}

/**
 * Hook for listening to oracle callbacks
 */
export function useOracleCallback(
  requestId: number | null,
  relayerClient: RelayerClient | null,
  onResult?: (result: any) => void,
  onError?: (error: Error) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [callbackResult, setCallbackResult] = useState<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!requestId || !relayerClient) {
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const listenForCallback = async () => {
      try {
        console.log('[useOracleCallback] Listening for requestId:', requestId);
        const result = await relayerClient.waitForOracleCallback(
          requestId,
          5 * 60 * 1000 // 5 min timeout
        );
        
        if (!controller.signal.aborted) {
          setCallbackResult(result);
          onResult?.(result);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          const err = error instanceof Error ? error : new Error(String(error));
          console.error('[useOracleCallback] Error:', err);
          onError?.(err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsListening(false);
        }
      }
    };

    listenForCallback();

    return () => {
      controller.abort();
    };
  }, [requestId, relayerClient, onResult, onError]);

  return { isListening, callbackResult };
}
