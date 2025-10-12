# Universal FHEVM SDK (Mock Showcase)

This directory contains a mock implementation of the Universal FHEVM SDK, designed specifically for this showcase application. It simulates the core concepts of a Fully Homomorphic Encryption (FHE) SDK without connecting to a real blockchain or performing actual cryptographic operations.

## Purpose

The goal of this mock SDK is to demonstrate:
1.  **A clear architectural separation** between the application logic (`services/fhevmService.ts`) and the underlying confidential computing layer (the SDK).
2.  **The developer experience** of integrating an FHE-based SDK into a frontend application.
3.  **Simulated asynchronous operations** that mimic network latency for encryption, relayer calls, and decryption.

## Quick Setup & Usage

The SDK is designed for easy integration. Here's how it's used within the showcase:

1.  **Import the factory function:**
    ```typescript
    import { createInstance } from '../fhevm-sdk';
    ```

2.  **Create an instance:**
    The `createInstance` function takes a configuration object. The `mode` can be `'dummy'` (simulates success) or `'live'` (simulates failure for showcase purposes).
    ```typescript
    // In a service or hook
    const fhevm = createInstance({
      mode: isLiveMode ? 'live' : 'dummy',
    });
    ```

3.  **Execute a confidential transaction:**
    Use the `execute` method on the instance. It takes the transaction details and returns a promise that resolves with the outcome.
    ```typescript
    const result = await fhevm.execute(transactionDetails);

    if (result.success) {
      console.log('Transaction succeeded with hash:', result.data.transactionHash);
    } else {
      console.error('Transaction failed:', result.error);
    }
    ```

## SDK Structure

-   `index.ts`: The public entry point of the SDK. It exports the `createInstance` factory function.
-   `mock-instance.ts`: Contains the concrete implementation of the mock FHEVM instance, including all the simulated logic.
-   `types.ts`: Defines the TypeScript interfaces for the SDK's public API, such as `FhevmInstance` and configuration options.
-   `README.md`: This file.

This structure ensures that the application only interacts with a well-defined public API (`index.ts` and `types.ts`), while the internal implementation details are encapsulated.
