# ZAMA DEX FHE - Sepolia Testnet Deployment Guide

This guide walks you through deploying the ZAMA DEX FHE smart contracts on Sepolia testnet.

## Prerequisites

1. **Node.js and npm**: Latest LTS version
2. **Sepolia ETH**: Get free Sepolia ETH from [faucet.sepolia.dev](https://faucet.sepolia.dev) or [Infura faucet](https://www.infura.io/faucet/sepolia)
3. **Infura Account**: Create a free account at [infura.io](https://infura.io)
4. **MetaMask**: Install MetaMask browser extension
5. **GitHub Repository**: Clone this repository

## Step 1: Setup Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in `.env` with your credentials:
   ```bash
   # Get your Infura Project ID from https://infura.io/dashboard
   INFURA_PROJECT_ID=your_infura_project_id_here

   # Export your wallet's private key from MetaMask
   # WARNING: Never commit this to git! Only use on testnet!
   # How to export: MetaMask > Account Details > Export Private Key
   PRIVATE_KEY=your_private_key_without_0x_prefix
   ```

3. **Security Note**: 
   - Never share your private key
   - `.env` is already in `.gitignore` - do not commit it
   - Use only testnet wallets with small amounts
   - Never use mainnet private keys

## Step 2: Install Dependencies

```bash
npm install
```

## Step 3: Compile Smart Contracts

```bash
npm run compile
```

Output should show:
```
Compiled 2 Solidity files successfully
  - contracts/DEX.sol
  - contracts/Token.sol
```

## Step 4: Run Tests (Optional but Recommended)

Verify contracts work locally before deploying:

```bash
npm test
```

All 11 tests should pass:
```
✔ Should deploy with correct token address
✔ Should initialize with zero liquidity
✔ Should allow initial liquidity provision
✔ Should allow adding more liquidity
✔ Should reject invalid liquidity amounts
✔ Should perform ETH to Token swap
✔ Should perform Token to ETH swap
✔ Should reject zero amount swap
✔ Should allow liquidity withdrawal
✔ Should reject withdrawal with insufficient liquidity
✔ Should return correct reserves

11 passing
```

## Step 5: Deploy to Sepolia

Deploy both ZamaToken and DEX contracts:

```bash
npm run deploy:sepolia
```

### Expected Output:

```
Starting contract deployment...

Deploying contracts with account: 0x...YOUR_ADDRESS...
Account balance: ...

1. Deploying ZamaToken...
✓ ZamaToken deployed to: 0x...TOKEN_ADDRESS...

2. Deploying DEX...
✓ DEX deployed to: 0x...DEX_ADDRESS...

✓ Deployment info saved to: deployments/sepolia-deployment.json

=== Deployment Summary ===
Network: sepolia
ZamaToken: 0x...TOKEN_ADDRESS...
DEX: 0x...DEX_ADDRESS...
Deployer: 0x...YOUR_ADDRESS...
```

## Step 6: Verify Deployment

1. **Check Deployment File**:
   ```bash
   cat deployments/sepolia-deployment.json
   ```
   This saves your contract addresses for reference.

2. **Verify on Sepolia Etherscan**:
   - Go to [https://sepolia.etherscan.io](https://sepolia.etherscan.io)
   - Search for your contract address
   - Confirm contract creation and code

3. **Update Frontend Configuration**:
   - If needed, update contract addresses in `/src/constants.ts` or your frontend config
   - ABI files are generated in `/artifacts/contracts/`

## Step 7: Interact with Deployed Contracts

### Using Frontend:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) and:
1. Connect MetaMask to Sepolia network
2. Use the DEX interface to:
   - Add liquidity to the pool
   - Perform ETH <-> ZAMA token swaps
   - Withdraw liquidity

### Using Hardhat Console:

```bash
npx hardhat console --network sepolia
```

Then in console:
```javascript
// Get deployed contracts
const dexAddress = "0x..."; // from deployments/sepolia-deployment.json
const tokenAddress = "0x...";

const dex = await ethers.getContractAt("DEX", dexAddress);
const token = await ethers.getContractAt("ZamaToken", tokenAddress);

// Check reserves
const [ethReserve, tokenReserve] = await dex.getReserves();
console.log("ETH Reserve:", ethers.utils.formatEther(ethReserve));
console.log("Token Reserve:", ethers.utils.formatEther(tokenReserve));

// Check your liquidity
const signer = await ethers.getSigner();
const myLiquidity = await dex.liquidity(signer.address);
console.log("Your LP Tokens:", ethers.utils.formatEther(myLiquidity));
```

## Troubleshooting

### "Invalid Project ID" Error
- Verify INFURA_PROJECT_ID is correct
- Check for extra spaces or quotes in `.env`

### "Insufficient Funds" Error
- Your account doesn't have enough Sepolia ETH
- Get more from [faucet.sepolia.dev](https://faucet.sepolia.dev)

### Transaction Failed: "Insufficient Balance"
- Ensure ZamaToken approval is set for DEX contract
- Check token balance before depositing

### "PRIVATE_KEY not set" Error
- Ensure `.env` file exists and has PRIVATE_KEY
- Restart terminal after updating `.env`

### Contract Not Showing on Etherscan
- Wait a few blocks for confirmation (10-30 seconds)
- Verify network is set to Sepolia
- Check if transaction hash shows in MetaMask

## Deployment on Other Networks

### Deploy on Localhost (Hardhat Node):

```bash
# Terminal 1: Start Hardhat node
npx hardhat node

# Terminal 2: Deploy to localhost
npm run deploy:localhost
```

### Add New Network:

Edit `hardhat.config.js`:
```javascript
networks: {
  yournetwork: {
    url: `https://your-rpc-url/v3/${process.env.YOUR_API_KEY}`,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

Then: `npx hardhat run scripts/deploy.js --network yournetwork`

## Security Considerations

1. **Never use mainnet private keys** - Only test with testnet wallets
2. **Keep `.env` private** - It's in `.gitignore` for a reason
3. **Verify contracts** - Always verify bytecode matches source
4. **Test thoroughly** - Run `npm test` before deploying
5. **Monitor deployments** - Watch transaction status on Etherscan

## Next Steps

1. Share deployment addresses with your team
2. Update frontend to use deployed contract addresses
3. Test all DEX functions on Sepolia
4. Submit to Zama Builder Track program
5. Consider contract upgrades or additional features

## Support

- Zama Documentation: [https://docs.zama.ai](https://docs.zama.ai)
- Hardhat Documentation: [https://hardhat.org](https://hardhat.org)
- Sepolia Faucet: [https://faucet.sepolia.dev](https://faucet.sepolia.dev)
- Sepolia Explorer: [https://sepolia.etherscan.io](https://sepolia.etherscan.io)

---

**Last Updated**: October 18, 2025
