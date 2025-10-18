const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying FHEDEX (FHE-enabled DEX)...\n");

  // Get token address from environment
  const tokenAddress = "0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636"; // Sepolia ZamaToken
  if (!tokenAddress) {
    throw new Error("Token address not set");
  }

  console.log(`📦 Token address: ${tokenAddress}`);
  console.log(`🌐 Network: ${hre.network.name}`);

  try {
    // Deploy FHEDEX
    console.log("\n⏳ Deploying FHEDEX contract...");
    const FHEDEX = await hre.ethers.getContractFactory("FHEDEX");
    const fhedex = await FHEDEX.deploy(tokenAddress);
    
    console.log(`📝 Transaction hash: ${fhedex.deployTransaction.hash}`);
    await fhedex.deployed();

    const fhedexAddress = fhedex.address;
    console.log(`\n✅ FHEDEX deployed successfully!`);
    console.log(`📍 Contract address: ${fhedexAddress}`);

    // Verify deployment
    const tokenAddressInContract = await fhedex.token();
    console.log(`\n🔍 Verification:`);
    console.log(`   Token address in contract: ${tokenAddressInContract}`);

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

    console.log(`\n🎉 Deployment complete!`);
  } catch (error) {
    console.error("❌ Deployment error:", error);
    process.exitCode = 1;
  }
}

main();
