/**
 * Script to distribute test ZAMA tokens to test users
 * 
 * Usage:
 * 1. Edit TEST_USERS array below with wallet addresses
 * 2. Adjust AMOUNT_PER_USER if needed
 * 3. Run: npx hardhat run scripts/distribute-test-tokens.js --network sepolia
 * 
 * Example:
 * const TEST_USERS = [
 *   "0x1111111111111111111111111111111111111111",
 *   "0x2222222222222222222222222222222222222222",
 *   "0x3333333333333333333333333333333333333333"
 * ];
 * 
 * Current Status:
 * - Deployer ZAMA: 3992
 * - DEX Pool ZAMA: 1007
 * - Total Available: 4999 ZAMA
 * - Amount per user: 5 ZAMA
 * - Max users: ~1000 (4999 / 5)
 */

const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("=== Distributing Test ZAMA Tokens ===\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Distributing from account:", deployer.address);

  // Get deployment info
  const DEPLOYMENT_FILE = "deployments/sepolia-deployment.json";
  if (!fs.existsSync(DEPLOYMENT_FILE)) {
    console.error("❌ Deployment file not found. Run 'npm run deploy:sepolia' first");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(DEPLOYMENT_FILE, "utf8"));
  const ZAMA_TOKEN_ADDRESS = deployment.zamaToken;

  const zamaToken = await hre.ethers.getContractAt("ZamaToken", ZAMA_TOKEN_ADDRESS);

  // List of test users (you can customize this)
  const TEST_USERS = [
    // Example addresses - replace with actual test user addresses
    // "0x1234567890123456789012345678901234567890",
    // Add more test addresses here
  ];

  const AMOUNT_PER_USER = hre.ethers.utils.parseUnits("5", 18); // 5 ZAMA per user (adjustable)

  console.log("📋 Test Tokens Distribution Plan:");
  console.log("  Token Address:", ZAMA_TOKEN_ADDRESS);
  console.log("  Amount per user:", hre.ethers.utils.formatUnits(AMOUNT_PER_USER, 18), "ZAMA");
  console.log("  Number of users:", TEST_USERS.length);
  console.log("  Total to distribute:", hre.ethers.utils.formatUnits(
    AMOUNT_PER_USER.mul(TEST_USERS.length), 18
  ), "ZAMA\n");

  // Check deployer balance
  const deployerBalance = await zamaToken.balanceOf(deployer.address);
  const totalNeeded = AMOUNT_PER_USER.mul(TEST_USERS.length);

  console.log("🔍 Balance Check:");
  console.log("  Deployer ZAMA balance:", hre.ethers.utils.formatUnits(deployerBalance, 18), "ZAMA");
  console.log("  Total needed:", hre.ethers.utils.formatUnits(totalNeeded, 18), "ZAMA");

  if (deployerBalance.lt(totalNeeded)) {
    console.error("❌ Not enough ZAMA tokens to distribute!");
    process.exit(1);
  }
  console.log("✅ Sufficient balance\n");

  // Distribute tokens
  console.log("📤 Distributing tokens...\n");
  
  for (let i = 0; i < TEST_USERS.length; i++) {
    const user = TEST_USERS[i];
    try {
      const tx = await zamaToken.transfer(user, AMOUNT_PER_USER);
      await tx.wait();
      console.log(`✅ User ${i + 1}/${TEST_USERS.length} (${user}): ${hre.ethers.utils.formatUnits(AMOUNT_PER_USER, 18)} ZAMA sent`);
    } catch (error) {
      console.error(`❌ User ${i + 1} transfer failed:`, error.message);
    }
  }

  console.log("\n✅ Token distribution complete!");
  console.log("\n📋 Quick Start for Test Users:");
  console.log("  1. Visit: https://zama-dex-fhе.vercel.app (or your deployed URL)");
  console.log("  2. Enable 'Live Mode' button");
  console.log("  3. Click 'Connect Wallet' (MetaMask on Sepolia)");
  console.log("  4. Verify you received " + hre.ethers.utils.formatUnits(AMOUNT_PER_USER, 18) + " ZAMA tokens");
  console.log("  5. Test operations:");
  console.log("     - Swap: ETH ↔ ZAMA");
  console.log("     - Deposit: Add liquidity");
  console.log("     - Withdraw: Remove liquidity");
  console.log("\n💡 Note: You can earn more tokens by swapping!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
