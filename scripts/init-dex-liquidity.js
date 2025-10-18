const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("=== Initializing DEX with Liquidity ===\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Initializing with account:", deployer.address);

  // Deployment info'yu oku
  const DEPLOYMENT_FILE = "deployments/sepolia-deployment.json";
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    console.error("❌ Deployment file not found. Run 'npm run deploy:sepolia' first");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
  const ZAMA_TOKEN_ADDRESS = deployment.zamaToken;
  const DEX_ADDRESS = deployment.dex;

  console.log("📋 Contracts:");
  console.log("  ZamaToken:", ZAMA_TOKEN_ADDRESS);
  console.log("  DEX:", DEX_ADDRESS);
  console.log("");

  // Contract instances
  const zamaToken = await hre.ethers.getContractAt("ZamaToken", ZAMA_TOKEN_ADDRESS);
  const dex = await hre.ethers.getContractAt("DEX", DEX_ADDRESS);

  // Initial amounts
  const INITIAL_ETH = hre.ethers.utils.parseEther("0.1"); // 0.1 ETH (yeterli olmalı)
  const INITIAL_TOKENS = hre.ethers.utils.parseUnits("500", 18); // 500 ZAMA

  console.log("💰 Initial Liquidity Amounts:");
  console.log("  ETH:", hre.ethers.utils.formatEther(INITIAL_ETH), "ETH");
  console.log("  ZAMA:", hre.ethers.utils.formatUnits(INITIAL_TOKENS, 18), "ZAMA");
  console.log("");

  // Check deployer's token balance
  console.log("🔍 Checking deployer balances...");
  const tokenBalance = await zamaToken.balanceOf(deployer.address);
  const ethBalance = await deployer.getBalance();
  
  console.log("  ETH Balance:", hre.ethers.utils.formatEther(ethBalance));
  console.log("  ZAMA Balance:", hre.ethers.utils.formatUnits(tokenBalance, 18));
  
  if (tokenBalance.lt(INITIAL_TOKENS)) {
    console.error("❌ Not enough ZAMA tokens. Have:", 
      hre.ethers.utils.formatUnits(tokenBalance, 18), 
      "Need:", 
      hre.ethers.utils.formatUnits(INITIAL_TOKENS, 18));
    process.exit(1);
  }
  console.log("");

  // Approve DEX to spend tokens
  console.log("📝 Step 1: Approving DEX to spend tokens...");
  const approveTx = await zamaToken.approve(DEX_ADDRESS, INITIAL_TOKENS);
  await approveTx.wait();
  console.log("✅ Approval confirmed");
  console.log("");

  // Add liquidity
  console.log("📝 Step 2: Adding initial liquidity...");
  const depositTx = await dex.deposit(INITIAL_TOKENS, { value: INITIAL_ETH });
  const receipt = await depositTx.wait();
  console.log("✅ Liquidity added. Transaction:", receipt.transactionHash);
  console.log("");

  // Verify state
  console.log("🔍 Verifying DEX state...");
  const [ethReserve, tokenReserve] = await dex.getReserves();
  const totalLiquidity = await dex.totalLiquidity();
  const deployerLiquidity = await dex.liquidity(deployer.address);

  console.log("  ETH Reserve:", hre.ethers.utils.formatEther(ethReserve), "ETH");
  console.log("  Token Reserve:", hre.ethers.utils.formatUnits(tokenReserve, 18), "ZAMA");
  console.log("  Total Liquidity:", hre.ethers.utils.formatUnits(totalLiquidity, 18), "LP");
  console.log("  Deployer LP Tokens:", hre.ethers.utils.formatEther(deployerLiquidity));
  console.log("");

  // Check DEX token balance
  const dexTokenBalance = await zamaToken.balanceOf(DEX_ADDRESS);
  console.log("📊 DEX Token Balance:", hre.ethers.utils.formatUnits(dexTokenBalance, 18), "ZAMA");
  console.log("");

  console.log("✅ DEX Initialization Complete!");
  console.log("   DEX now has liquidity and is ready for swaps");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
