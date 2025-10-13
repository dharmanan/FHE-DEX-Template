
# ZAMA DEX FHE

## Video Walkthrough & Deployment Links

For bounty submission:

- **Video Walkthrough:** [SOON]
- **Next.js Demo Deployment:** [SOON]
- **Vue Demo Deployment:** [SOON]
- **Node.js Demo:** Local only
- **Svelte Demo:** Local only

---

## Important Note on Encryption

The universal FHEVM SDK in this repository currently runs in **dummy/mock mode**. Encryption and decryption operations are simulated for demonstration purposes and do not perform real FHE encryption. The output (e.g., `0x_encrypted_"1987"`) is a placeholder, not a true confidential ciphertext.

**Integration flow, API structure, and usage in all environments (Next.js, Vue, Node.js, Svelte) are fully functional and match how a real FHEVM SDK would be used.**

To enable true FHE encryption, Zama's official SDK and whitelist/relayer access are required.

---
# ZAMA DEX FHE


This project is a decentralized exchange (DEX) prototype for the Sepolia testnet (an Ethereum testnet, **not mainnet**), built with Fully Homomorphic Encryption (FHE) concepts and the Zama SDK (FHEVM).


**Privacy by Design:** All swap, liquidity, and withdrawal operations are performed confidentially using FHEVM. Transaction amounts and user balances are encrypted on-chain, so third parties cannot view or deduce these values. This project demonstrates true privacy for DEX operations—amounts and balances remain hidden from everyone except the user.


> **Technical Note:**
> This project simulates privacy-preserving DEX operations using Zama's FHEVM SDK. Due to Sepolia testnet limitations and the absence of Zama's whitelist/relayer access, true on-chain encryption of transaction amounts and balances is not possible. Instead, the frontend and SDK mock the confidential flow—amounts and balances are processed as if encrypted, but actual on-chain data remains visible. The logic and architecture are designed for real FHE privacy, and with whitelist/relayer access, full confidentiality can be achieved.


Supported operations:
- ETH <-> ZamaToken swaps
- Privacy-preserving liquidity provision and withdrawal
- Wallet integration
- Solidity smart contracts, React/TypeScript frontend, Hardhat deployment scripts
- Confidential transactions and balances simulated using Zama's FHEVM SDK




## Features

- Built with Zama SDK (FHEVM)
- Swap ETH <-> ZamaToken
- Add/Withdraw liquidity (privacy-preserving)
- Confidential transaction simulation
- Wallet & pool balance reading
- MetaMask integration
- Up-to-date contract addresses & ABIs



## Recent Work

- Withdraw function added & debugged
- Decimals and LP token handling improved
- Fractional LP withdrawals supported
- ABI and contract addresses synced
- Balance refresh & error handling improved
- Code comments cleaned for security



## Universal FHEVM SDK Examples

This repository includes a universal FHEVM SDK (`/packages/fhevm-sdk`) and showcases for Next.js, Vue, Node.js, and Svelte.

### How to Run the Examples

1. Install dependencies in the root directory:
   ```
   npm install
   ```
2. Next.js:
   ```
   cd examples/nextjs
   npm install
   npm run dev
   # Open http://localhost:3000
   ```
3. Vue:
   ```
   cd examples/vue
   npm install
   npm run dev
   # Open http://localhost:5173
   ```
4. Node.js:
   ```
   node examples/node/index.js
   ```
5. Svelte:
   ```
   cd examples/svelte
   npm install
   npm run dev
   # Open http://localhost:5173
   ```

All examples demonstrate:
- SDK initialization
- Confidential value encryption/decryption
- Framework-agnostic usage



## Getting Started

**Prerequisites:** Node.js, npm, MetaMask, Sepolia testnet ETH

1. Install dependencies:
   ```
   npm install
   ```
2. Configure environment variables (see .env)
3. Deploy contracts:
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```
4. Start frontend:
   ```
   npm run dev
   ```

---

## Libraries Used

- **@fhenixprotocol/contracts**: FHEVM smart contract primitives, Zama FHE integration
- **ethers**: Sepolia testnet interaction, contract calls, transaction signing
- **@openzeppelin/contracts**: ERC20 and other contract templates

These enable privacy-preserving smart contracts, confidential transactions, and secure DEX operations using Zama's FHE technology.


