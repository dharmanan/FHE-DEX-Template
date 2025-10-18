/**
 * Encryption Service
 * Handles FHE encryption of amounts and calldata preparation for Zama FHEVM
 */

import { BigNumber, utils, Contract } from 'ethers';
import { EncryptedAmount, EncryptionConfig, SwapParams } from '../types/relayer';

export class EncryptionService {
  private contractAddress: string;
  private contractAbi: any[];
  private enableLogging: boolean;
  private enableValidation: boolean;
  private publicKey?: string;

  constructor(config: EncryptionConfig) {
    this.contractAddress = config.contractAddress;
    this.contractAbi = config.contractAbi;
    this.publicKey = config.publicKey;
    this.enableLogging = config.enableLogging ?? false;
    this.enableValidation = config.enableValidation ?? true;

    this.log('EncryptionService initialized', {
      contractAddress: this.contractAddress,
    });
  }

  /**
   * Encrypt an amount to euint64 format for Zama FHEVM
   * In production, this uses Zama's encryption library
   */
  async encryptAmount(amount: BigNumber | string | number): Promise<EncryptedAmount> {
    try {
      const bnAmount = BigNumber.from(amount);

      this.log('Encrypting amount', {
        original: bnAmount.toString(),
      });

      // In production, this would use Zama's FHE encryption library
      // For now, we create a placeholder that will be replaced
      const encryptedValue = await this.performFHEEncryption(bnAmount);

      const encrypted: EncryptedAmount = {
        value: encryptedValue,
        metadata: {
          original: bnAmount,
          timestamp: Date.now(),
          nonce: Math.floor(Math.random() * 1000000),
        },
      };

      if (this.enableValidation) {
        await this.verifyEncryption(encrypted);
      }

      this.log('Amount encrypted successfully', {
        encryptedLength: encryptedValue.length,
      });

      return encrypted;
    } catch (error) {
      this.log('Encryption failed', { error: String(error) });
      throw new Error(`Encryption failed: ${error}`);
    }
  }

  /**
   * Prepare calldata for a contract function call with encrypted parameters
   */
  async prepareCalldata(
    methodName: string,
    params: any[]
  ): Promise<string> {
    try {
      this.log('Preparing calldata', {
        method: methodName,
        paramCount: params.length,
      });

      // Create contract interface
      const iface = new utils.Interface(this.contractAbi);

      // Get function signature
      const functionFragment = iface.getFunction(methodName);
      if (!functionFragment) {
        throw new Error(`Function ${methodName} not found in contract ABI`);
      }

      // Encode function call
      // For encrypted swaps, params should include EncryptedAmount objects
      const encodedParams = params.map(param => {
        if (param && typeof param === 'object' && param.value) {
          // This is an EncryptedAmount
          return param.value;
        }
        return param;
      });

      const calldata = iface.encodeFunctionData(methodName, encodedParams);

      this.log('Calldata prepared successfully', {
        calldata: calldata.substring(0, 100) + '...',
      });

      return calldata;
    } catch (error) {
      this.log('Calldata preparation failed', { error: String(error) });
      throw new Error(`Calldata preparation failed: ${error}`);
    }
  }

  /**
   * Verify encryption integrity
   */
  async verifyEncryption(encrypted: EncryptedAmount): Promise<boolean> {
    try {
      // Validate encrypted value format
      if (!encrypted.value.startsWith('0x')) {
        throw new Error('Invalid encrypted value format');
      }

      if (encrypted.value.length < 10) {
        throw new Error('Encrypted value too short');
      }

      // In production, this would verify cryptographic properties
      this.log('Encryption verified', {
        valueLength: encrypted.value.length,
      });

      return true;
    } catch (error) {
      this.log('Encryption verification failed', { error: String(error) });
      throw error;
    }
  }

  /**
   * Get encryption metadata for debugging
   */
  getEncryptionMetadata(encrypted: EncryptedAmount): any {
    return encrypted.metadata || {};
  }

  /**
   * Private: Perform actual FHE encryption
   * This would integrate with Zama's encryption library in production
   */
  private async performFHEEncryption(amount: BigNumber): Promise<string> {
    // In production, this would use something like:
    // const encrypted = await fhevm.encrypt64(amount, publicKey);

    // For now, we create a mock encrypted value
    // Structure: 0x + 64 hex chars (256 bits for euint64 encryption)
    const randomBytes = Math.random().toString(16).substring(2);
    const paddedBytes = randomBytes.padEnd(64, '0');
    const encryptedHex = '0x' + paddedBytes.substring(0, 64);

    this.log('FHE encryption performed', {
      encryptedValue: encryptedHex.substring(0, 20) + '...',
    });

    return encryptedHex;
  }

  /**
   * Private: Logging utility
   */
  private log(message: string, data?: any): void {
    if (this.enableLogging) {
      console.log(`[EncryptionService] ${message}`, data || '');
    }
  }
}

/**
 * Encryption utility functions
 */
export const encryptionUtils = {
  /**
   * Create an EncryptedAmount from raw hex value
   */
  createEncryptedAmount(hexValue: string, original?: BigNumber): EncryptedAmount {
    return {
      value: hexValue,
      metadata: {
        original,
        timestamp: Date.now(),
      },
    };
  },

  /**
   * Verify encrypted amount is valid
   */
  isValidEncryptedAmount(encrypted: any): boolean {
    return (
      encrypted &&
      typeof encrypted === 'object' &&
      typeof encrypted.value === 'string' &&
      encrypted.value.startsWith('0x') &&
      encrypted.value.length >= 10
    );
  },

  /**
   * Format encrypted amount for logging (redacted for security)
   */
  formatEncryptedForLogging(encrypted: EncryptedAmount): string {
    const start = encrypted.value.substring(0, 10);
    const end = encrypted.value.substring(encrypted.value.length - 6);
    return `${start}...${end}`;
  },

  /**
   * Create euint64 conversion helper
   */
  async encodeAsEuint64(value: BigNumber | string): Promise<string> {
    const bn = BigNumber.from(value);

    // euint64 max value: 2^64 - 1
    const maxEuint64 = BigNumber.from('18446744073709551615');

    if (bn.gt(maxEuint64)) {
      throw new Error('Value exceeds euint64 max value');
    }

    if (bn.lt(0)) {
      throw new Error('Value must be non-negative for euint64');
    }

    return bn.toHexString();
  },
};

/**
 * Create EncryptionService instance
 */
export function createEncryptionService(
  contractAddress: string,
  contractAbi: any[],
  options?: Partial<EncryptionConfig>
): EncryptionService {
  return new EncryptionService({
    contractAddress,
    contractAbi,
    ...options,
  });
}
