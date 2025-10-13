import React, { useState } from 'react';
import { FhevmSDK, FhevmConfig } from '../../../packages/fhevm-sdk/dist/core';
import { useFhevm, useEncryptedInput, useDecryption } from '../../../packages/fhevm-sdk/dist/react';
import { ethers } from 'ethers';
import { DEX_CONTRACT_ADDRESS, DEX_ABI_OBJ } from '../../../constants';

const config: FhevmConfig = { mode: 'dummy' };

export default function Home() {
  const sdk = useFhevm(config);
  const [input, setInput] = useState('');
  const { encrypted, encrypt } = useEncryptedInput(sdk, input);
  const { decrypted, decrypt } = useDecryption(sdk, encrypted || '');

  // Confidential Swap State
  const [swapStatus, setSwapStatus] = useState<string | null>(null);

  // Simulate confidential swap (dummy, no wallet interaction)
  const handleConfidentialSwap = async () => {
    setSwapStatus('Processing confidential swap...');
    // Encrypt swap amount
    const encryptedAmount = await sdk.encrypt(input);
    // Normally, you would send encryptedAmount to the contract
    // Here, we just simulate the flow
    setTimeout(() => {
      setSwapStatus(`Swap completed! Encrypted amount sent: ${encryptedAmount}`);
    }, 1200);
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Universal FHEVM SDK Next.js Showcase</h1>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter confidential value"
      />
      <button onClick={encrypt} style={{ marginLeft: 8 }}>Encrypt</button>
      {encrypted && (
        <div style={{ marginTop: 16 }}>
          <div>Encrypted: {encrypted}</div>
          <button onClick={decrypt} style={{ marginTop: 8 }}>Decrypt</button>
        </div>
      )}
      {decrypted && (
        <div style={{ marginTop: 16 }}>
          <div>Decrypted: {JSON.stringify(decrypted)}</div>
        </div>
      )}
      <hr style={{ margin: '32px 0' }} />
      <h2>Confidential Swap Demo</h2>
      <button onClick={handleConfidentialSwap} style={{ marginTop: 8 }}>
        Perform Confidential Swap
      </button>
      {swapStatus && (
        <div style={{ marginTop: 16 }}>
          <strong>{swapStatus}</strong>
        </div>
      )}
    </div>
  );
}
