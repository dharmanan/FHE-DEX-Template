const { ethers } = require("ethers");
const fs = require("fs");
require("dotenv").config();

const ZAMA_TOKEN_ABI = JSON.parse(fs.readFileSync("artifacts/contracts/ZamaToken.sol/ZamaToken.json", "utf8")).abi;
const FHEDEX_ABI = JSON.parse(fs.readFileSync("artifacts/contracts/FHEDEX.sol/FHEDEX.json", "utf8")).abi;
const ZAMA_TOKEN_BYTECODE = JSON.parse(fs.readFileSync("artifacts/contracts/ZamaToken.sol/ZamaToken.json", "utf8")).bytecode;
const FHEDEX_BYTECODE = JSON.parse(fs.readFileSync("artifacts/contracts/FHEDEX.sol/FHEDEX.json", "utf8")).bytecode;

async function main() {
  console.log("Starting Zama FHEVM DEX deployment via direct ethers...\n");
  
  // Provider ve signer
  const RPC_URL = "https://eth-sepolia.public.blastapi.io";
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env");
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deploying with account:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");
  
  // 1. Deploy ZamaToken
  console.log("1. Deploying ZamaToken...");
  const tokenFactory = new ethers.ContractFactory(ZAMA_TOKEN_ABI, ZAMA_TOKEN_BYTECODE, wallet);
  const zamaToken = await tokenFactory.deploy();
  await zamaToken.waitForDeployment();
  const tokenAddress = await zamaToken.getAddress();
  console.log(`✓ ZamaToken deployed to: ${tokenAddress}\n`);
  
  // 2. Deploy FHEDEX
  console.log("2. Deploying FHEDEX...");
  const dexFactory = new ethers.ContractFactory(FHEDEX_ABI, FHEDEX_BYTECODE, wallet);
  const fhedex = await dexFactory.deploy(tokenAddress);
  await fhedex.waitForDeployment();
  const fhedexAddress = await fhedex.getAddress();
  console.log(`✓ FHEDEX deployed to: ${fhedexAddress}\n`);
  
  // 3. Initialize pool with 0.5 ETH + 5000 ZAMA
  console.log("3. Initializing pool...");
  
  // First approve token transfer
  console.log("   - Approving token transfer...");
  const approveTx = await zamaToken.approve(fhedexAddress, ethers.parseUnits("5000", 18));
  await approveTx.wait();
  console.log("   ✓ Token approval confirmed");
  
  // Initialize pool with proper amounts
  console.log("   - Initializing with 0.5 ETH + 5000 ZAMA...");
  const initTx = await fhedex.initializePool(ethers.parseUnits("5000", 18), {
    value: ethers.parseEther("0.5")
  });
  await initTx.wait();
  console.log("   ✓ Pool initialized\n");
  
  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    zamaToken: tokenAddress,
    fhedex: fhedexAddress,
    deployer: wallet.address,
    timestamp: new Date().toISOString()
  };
  
  const fileName = `deployments/sepolia-deployment-${Date.now()}.json`;
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("=== Deployment Summary ===");
  console.log(`Network: sepolia`);
  console.log(`Chain ID: 11155111`);
  console.log(`ZamaToken: ${tokenAddress}`);
  console.log(`FHEDEX: ${fhedexAddress}`);
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Timestamp: ${deploymentInfo.timestamp}`);
  console.log(`\nDeployment info saved to: ${fileName}`);
  
  console.log("\n📝 Update constants.ts:");
  console.log(`export const DEX_CONTRACT_ADDRESS = '${fhedexAddress}';`);
  console.log(`export const ZAMA_TOKEN_ADDRESS = '${tokenAddress}';`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
