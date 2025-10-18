import hre from "hardhat";

async function main() {
  console.log("🚀 Deploying FHEDEX (FHE-enabled DEX)...\n");

  // Get token address from environment
  const tokenAddress = process.env.ZAMA_TOKEN_ADDRESS;
  if (!tokenAddress) {
    throw new Error("ZAMA_TOKEN_ADDRESS not set in environment variables");
  }

  console.log(`📦 Token address: ${tokenAddress}`);
  console.log(`🌐 Network: ${hre.network.name}`);

  // Deploy FHEDEX
  const FHEDEX = await hre.ethers.getContractFactory("FHEDEX");
  const fhedex = await FHEDEX.deploy(tokenAddress);
  await fhedex.deploymentTransaction()?.wait(1);

  const fhedexAddress = await fhedex.getAddress();
  console.log(`\n✅ FHEDEX deployed successfully!`);
  console.log(`📍 Contract address: ${fhedexAddress}`);

  // Verify deployment
  const owner = await fhedex.token();
  console.log(`\n🔍 Verification:`);
  console.log(`   Token address in contract: ${owner}`);

  // Display important info for .env update
  console.log(`\n📝 Update your .env.production with:`);
  console.log(`   VITE_DEX_ADDRESS=${fhedexAddress}`);

  // Optionally verify on Etherscan
  if (hre.network.name === "sepolia") {
    console.log(`\n⏳ Wait ~2 minutes, then verify with:`);
    console.log(
      `   npx hardhat verify --network sepolia ${fhedexAddress} ${tokenAddress}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
