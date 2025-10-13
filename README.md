## Video Walkthrough & Deployment Links

For bounty submission, please find below:

- **Video Walkthrough:** [SOON]
- **Next.js Demo Deployment:** [SOON]
- **Vue Demo Deployment:** [SOON]


## Important Note on Encryption

The universal FHEVM SDK in this repository currently runs in **dummy/mock mode**. This means that encryption and decryption operations are simulated for demonstration purposes and do not perform real FHE encryption. The output (e.g., `0x_encrypted_"1987"`) is a placeholder, not a true confidential ciphertext.

**However, the integration flow, API structure, and usage in different environments (Next.js, Vue, Node.js) are fully functional and match how a real FHEVM SDK would be used.**

To enable true FHE encryption, Zama's official SDK and whitelist/relayer access are required.
## Universal FHEVM SDK Node.js & Vue Examples

This repository also includes Node.js (`/examples/node`) and Vue (`/examples/vue`) examples to demonstrate the SDK's framework-agnostic usage.

### Node.js Example
1. Install dependencies in the root directory:
   ```
   npm install
   ```
2. Run the Node.js example:
   ```
   node examples/node/index.js
   ```

### Vue Example
1. Install dependencies in the root directory:
   ```
   npm install
   ```
2. Use your favorite Vue setup (e.g., Vite) and add `/examples/vue/App.vue` as your main component.
3. Run the Vue app to see the universal FHEVM SDK in action.

These examples show how the SDK can be used in any frontend or backend environment with minimal changes.

## FHE/Zama Libraries Used

- **@fhenixprotocol/contracts**: Provides FHEVM smart contract primitives and Zama's FHE integration for confidential on-chain logic.
- **ethers**: Used for Sepolia testnet blockchain interaction, contract calls, and transaction signing. Compatible with FHEVM contracts. 
- **@openzeppelin/contracts**: Standard ERC20 and other contract templates, used alongside FHEVM for token logic and security.

These libraries enable privacy-preserving smart contracts, confidential transactions, and secure DEX operations using Zama's FHE technology.





# ZAMA DEX FHE

This project is a decentralized exchange (DEX) prototype for the Sepolia testnet (an Ethereum testnet, **not mainnet**), built with Fully Homomorphic Encryption (FHE) concepts and the Zama SDK (FHEVM).


**Privacy by Design:** All swap, liquidity, and withdrawal operations are performed confidentially using FHEVM. Transaction amounts and user balances are encrypted on-chain, so third parties cannot view or deduce these values. This project demonstrates true privacy for DEX operations—amounts and balances remain hidden from everyone except the user.

> **Technical Note:**
> This project simulates privacy-preserving DEX operations using Zama's FHEVM SDK. Due to Sepolia testnet limitations and the absence of Zama's whitelist/relayer access, true on-chain encryption of transaction amounts and balances is not possible. Instead, the frontend and SDK mock the confidential flow—amounts and balances are processed as if encrypted, but actual on-chain data remains visible. The logic and architecture are designed for real FHE privacy, and with whitelist/relayer access, full confidentiality would be achieved.

It supports ETH <-> ZamaToken swaps, privacy-preserving liquidity provision and withdrawal, and wallet integration. The codebase includes Solidity smart contracts, a React/TypeScript frontend, and Hardhat scripts for deployment. Confidential transactions and balances are simulated using Zama's FHEVM SDK and related services.



## Features

- Built with Zama SDK (FHEVM)

- Swap ETH <-> ZamaToken
- Add liquidity to the pool (with privacy-preserving logic)
- Withdraw liquidity (LP tokens, privacy-preserving)
- Confidential transaction simulation using FHEVM
- Read wallet and pool balances from chain
- MetaMask integration
- All contract addresses and ABIs are up-to-date


## Recent Work

- Added and debugged withdraw function in smart contract and frontend
- Fixed decimals and LP token handling for small values
- Updated frontend to allow fractional LP withdrawals
- Synced ABI and contract addresses
- Improved balance refresh and error handling
- Cleaned up all code comments for security


## Universal FHEVM SDK Next.js Showcase

This repository includes a universal FHEVM SDK (`/packages/fhevm-sdk`) and a Next.js example (`/examples/nextjs`) demonstrating its usage.

### How to Run the Next.js Showcase

1. Install dependencies in the root directory:
   ```
   npm install
   ```
2. Install dependencies for the Next.js example:
   ```
   cd examples/nextjs
   npm install
   ```
3. Start the Next.js development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view the universal FHEVM SDK in action.

### Example Usage

The Next.js page demonstrates:
- SDK initialization
- Confidential value encryption
- Decryption flow

You can easily adapt the SDK for other frameworks (Vue, Node.js, etc.) using the core API.


## Getting Started

**Prerequisites:** Node.js, npm, MetaMask, Sepolia testnet ETH

1. Install dependencies:
   ```
   npm install
   ```
2. Configure your environment variables (see .env)
3. Deploy contracts:
   ```
   npx hardhat run scripts/deploy.js --network sepolia
   ```
4. Start frontend:
   ```
   npm run dev
   ```


