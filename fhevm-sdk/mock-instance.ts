import { MOCK_API_DELAY } from '../constants';
import type { FhevmInstance, TransactionResult, FhevmConfig } from './types';
import type { TransactionDetails } from '../types';

export class MockFhevmInstance implements FhevmInstance {
  private config: FhevmConfig;

  constructor(config: FhevmConfig) {
    this.config = config;
  }

  private async mockEncrypt(value: any): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return `0x_encrypted_${JSON.stringify(value).substring(0, 20)}`;
  }

  private async mockCallRelayer(encryptedData: string): Promise<string> {
    console.log(`[FHEVM SDK - Mock] Calling relayer with: ${encryptedData}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY - 100));
    return `0x_relayer_response_for_${encryptedData}`;
  }

  private async mockDecrypt(encryptedData: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 50));
    console.log(`[FHEVM SDK - Mock] Decrypting: ${encryptedData}`);
    return { status: 'decrypted_ok' };
  }

  public async execute(details: TransactionDetails): Promise<TransactionResult> {
    console.log(`Executing confidential transaction via SDK (Mode: ${this.config.mode})`, details);

    if (this.config.mode === 'live') {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: false,
            error: "Live relayer/gateway not available (Whitelist required). Please use Dummy Mode.",
          });
        }, MOCK_API_DELAY);
      });
    }

    // Dummy Mode Simulation
    try {
      const encryptedInput = await this.mockEncrypt({ amount: details.inputAmount, asset: details.inputAsset });
      const relayerResponse = await this.mockCallRelayer(encryptedInput);
      const decryptedOutput = await this.mockDecrypt(relayerResponse);
      
      console.log("[FHEVM SDK - Mock] Full confidential flow completed.", decryptedOutput);
      
      return { success: true, data: { transactionHash: `0x_mock_tx_${Date.now()}` } };
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Unknown FHEVM simulation error';
      return { success: false, error };
    }
  }
}
