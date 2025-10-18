/**
 * RelayerClient Service
 * Handles communication with Zama Relayer for encrypted operations
 * Features: encrypted swap submission, callback polling, Oracle decryption requests
 */

export interface RelayerConfig {
  endpoint: string;
  chainId: number;
  enableLogging?: boolean;
}

export interface SwapSubmitRequest {
  encryptedAmount: string;
  contractAddress: string;
  userAddress: string;
  direction: 'ETH_TO_TOKEN' | 'TOKEN_TO_ETH';
  chainId: number;
}

export interface RelayerSubmitResponse {
  success: boolean;
  txHash: string;
  requestId: number;
  timestamp: number;
}

export interface RelayerStatusResponse {
  requestId: number;
  status: 'pending' | 'completed' | 'failed';
  result?: string;
  error?: string;
}

export class RelayerClient {
  private config: RelayerConfig;
  private pendingSwaps: Map<string, any> = new Map();
  private retryConfig = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 8000,
  };

  constructor(config: RelayerConfig) {
    this.config = config;
  }

  /**
   * Submit encrypted swap to relayer
   * Sends encrypted amount and waits for Oracle decryption callback
   */
  async submitEncryptedSwap(params: SwapSubmitRequest): Promise<RelayerSubmitResponse> {
    try {
      this.log(`📤 Submitting encrypted swap: ${params.direction}`);
      
      const response = await fetch(`${this.config.endpoint}/api/relayer/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Chain-ID': String(this.config.chainId),
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Relayer error: ${response.status} ${response.statusText}`);
      }

      const result: RelayerSubmitResponse = await response.json();
      
      if (!result.success) {
        throw new Error('Relayer submission failed');
      }

      this.log(`✅ Swap submitted: requestId=${result.requestId}, txHash=${result.txHash}`);
      
      // Track pending swap
      this.pendingSwaps.set(result.requestId.toString(), {
        txHash: result.txHash,
        submitTime: Date.now(),
        direction: params.direction,
      });

      return result;
    } catch (error) {
      this.log(`❌ Submit failed: ${error}`);
      throw error;
    }
  }

  /**
   * Request Oracle decryption for a pending swap
   * This triggers the KMS to decrypt the value and call handleDecryptedSwap on contract
   */
  async requestOracleDecryption(
    requestId: number,
    encryptedData: string,
    contractAddress: string
  ): Promise<void> {
    try {
      this.log(`🔐 Requesting Oracle decryption for requestId=${requestId}`);

      const response = await fetch(`${this.config.endpoint}/api/oracle/requestDecryption`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Chain-ID': String(this.config.chainId),
        },
        body: JSON.stringify({
          requestId,
          encryptedData,
          contractAddress,
          callbackFunction: 'handleDecryptedSwap',
        }),
      });

      if (!response.ok) {
        throw new Error(`Oracle error: ${response.status}`);
      }

      this.log(`✅ Oracle decryption requested for requestId=${requestId}`);
    } catch (error) {
      this.log(`❌ Oracle request failed: ${error}`);
      throw error;
    }
  }

  /**
   * Poll relayer for callback result from Oracle
   * Waits for handleDecryptedSwap callback to complete
   */
  async waitForOracleCallback(
    requestId: number,
    timeoutMs: number = 5 * 60 * 1000, // 5 minutes default
    onProgress?: (status: RelayerStatusResponse) => void
  ): Promise<RelayerStatusResponse> {
    this.log(`⏳ Waiting for Oracle callback: requestId=${requestId}, timeout=${timeoutMs}ms`);

    const startTime = Date.now();
    let lastError: Error | null = null;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.getTransactionStatus(requestId);

        if (onProgress) {
          onProgress(status);
        }

        if (status.status === 'completed') {
          this.log(`✅ Swap completed: requestId=${requestId}`);
          this.pendingSwaps.delete(requestId.toString());
          return status;
        }

        if (status.status === 'failed') {
          throw new Error(status.error || 'Oracle callback failed');
        }

        // Wait before next poll
        await this.delay(2000);
      } catch (error) {
        lastError = error as Error;
        this.log(`⚠️  Poll attempt failed: ${error}`);
        
        // Continue polling on transient errors
        await this.delay(2000);
      }
    }

    this.log(`❌ Oracle callback timeout after ${timeoutMs}ms`);
    throw new Error(lastError?.message || 'Oracle callback timeout');
  }

  /**
   * Get transaction status from relayer
   */
  async getTransactionStatus(requestId: number): Promise<RelayerStatusResponse> {
    try {
      const response = await fetch(
        `${this.config.endpoint}/api/relayer/status/${requestId}`,
        {
          headers: {
            'X-Chain-ID': String(this.config.chainId),
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.log(`⚠️  Status check error: ${error}`);
      throw error;
    }
  }

  /**
   * Get relayer health status
   */
  async getRelayerStatus(): Promise<{ status: string; version: string }> {
    try {
      const response = await fetch(`${this.config.endpoint}/api/health`);

      if (!response.ok) {
        throw new Error('Relayer unhealthy');
      }

      return await response.json();
    } catch (error) {
      this.log(`⚠️  Health check failed: ${error}`);
      throw error;
    }
  }

  /**
   * Cancel a pending swap
   */
  async cancelSwap(requestId: number): Promise<boolean> {
    try {
      this.log(`❌ Cancelling swap: requestId=${requestId}`);

      const response = await fetch(`${this.config.endpoint}/api/relayer/cancel/${requestId}`, {
        method: 'POST',
        headers: {
          'X-Chain-ID': String(this.config.chainId),
        },
      });

      if (response.ok) {
        this.pendingSwaps.delete(requestId.toString());
        return true;
      }

      return false;
    } catch (error) {
      this.log(`⚠️  Cancel failed: ${error}`);
      return false;
    }
  }

  /**
   * Get all pending swaps
   */
  getPendingSwaps(): Array<{ requestId: string; data: any }> {
    return Array.from(this.pendingSwaps.entries()).map(([requestId, data]) => ({
      requestId,
      data,
    }));
  }

  /**
   * Delay helper
   * @private
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Logging helper
   * @private
   */
  private log(message: string): void {
    if (this.config.enableLogging) {
      console.log(`[RelayerClient] ${message}`);
    }
  }
}
