// Node.js example for universal FHEVM SDK
const { FhevmSDK } = require('../../packages/fhevm-sdk/dist/core');

async function main() {
  const sdk = new FhevmSDK({ mode: 'dummy' });
  const input = 'confidential-node-value';
  const encrypted = await sdk.encrypt(input);
  console.log('Encrypted:', encrypted);
  const decrypted = await sdk.decrypt(encrypted);
  console.log('Decrypted:', decrypted);
}

main();
