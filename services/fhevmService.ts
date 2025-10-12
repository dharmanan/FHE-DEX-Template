import { createInstance, FhevmInstance, TransactionResult } from '../fhevm-sdk';
import type { TransactionDetails } from '../types';

export class FhevmService {
  private fhevm: FhevmInstance;

  constructor(isLiveMode: boolean) {
    // The service now creates an instance of the SDK,
    // abstracting the application from the SDK's internal implementation.
    this.fhevm = createInstance({
      mode: isLiveMode ? 'live' : 'dummy',
    });
  }

  public async executeConfidentialTransaction(details: TransactionDetails): Promise<TransactionResult> {
    console.log(`FhevmService is delegating transaction to the SDK.`);
    // The service's responsibility is now simplified to just calling the SDK's method.
    return this.fhevm.execute(details);
  }
}
