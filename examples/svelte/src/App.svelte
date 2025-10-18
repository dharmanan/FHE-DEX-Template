<script>
  import { onMount } from 'svelte';
  import { FhevmSDK } from '../../../packages/fhevm-sdk/core';

  let input = '';
  let encrypted = '';
  let decrypted = '';
  const sdk = new FhevmSDK({ mode: 'dummy' });

  async function encrypt() {
    encrypted = await sdk.encrypt(input);
  }

  async function decrypt() {
    decrypted = JSON.stringify(await sdk.decrypt(encrypted));
  }
</script>

<main style="padding: 40px;">
  <h1>Universal FHEVM SDK Svelte Showcase</h1>
  <input bind:value={input} placeholder="Enter confidential value" />
  <button on:click={encrypt}>Encrypt</button>
  {#if encrypted}
    <div style="margin-top: 16px;">Encrypted: {encrypted}</div>
    <button on:click={decrypt} style="margin-top: 8px;">Decrypt</button>
  {/if}
  {#if decrypted}
    <div style="margin-top: 16px;">Decrypted: {decrypted}</div>
  {/if}
</main>
