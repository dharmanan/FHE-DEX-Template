<template>
  <div style="padding: 40px;">
    <h1>Universal FHEVM SDK Vue Showcase</h1>
    <input v-model="input" placeholder="Enter confidential value" />
    <button @click="encrypt">Encrypt</button>
    <div v-if="encrypted" style="margin-top: 16px;">
      <div>Encrypted: {{ encrypted }}</div>
      <button @click="decrypt" style="margin-top: 8px;">Decrypt</button>
    </div>
    <div v-if="decrypted" style="margin-top: 16px;">
      <div>Decrypted: {{ decrypted }}</div>
    </div>
    <hr style="margin: 32px 0;" />
    <h2>Confidential Swap Demo</h2>
    <button @click="confidentialSwap" style="margin-top: 8px;">Perform Confidential Swap</button>
    <div v-if="swapStatus" style="margin-top: 16px;">
      <strong>{{ swapStatus }}</strong>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { FhevmSDK } from '../../../packages/fhevm-sdk/core';

const sdk = new FhevmSDK({ mode: 'dummy' });
const input = ref('');
const encrypted = ref('');
const decrypted = ref('');
const swapStatus = ref(null);

const encrypt = async () => {
  encrypted.value = await sdk.encrypt(input.value);
};

const decrypt = async () => {
  decrypted.value = JSON.stringify(await sdk.decrypt(encrypted.value));
};

const confidentialSwap = async () => {
  swapStatus.value = 'Processing confidential swap...';
  const encryptedAmount = await sdk.encrypt(input.value);
  setTimeout(() => {
    swapStatus.value = `Swap completed! Encrypted amount sent: ${encryptedAmount}`;
  }, 1200);
};
</script>
