const hre = require("hardhat");

async function main() {
  const FHEDEX_ADDRESS = "0x881Aa3BE4A1cb54e48533262DDBE36Af272785a5";
  const ZAMA_TOKEN = "0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636";
  
  const INITIAL_ETH = hre.ethers.utils.parseEther("0.1");  // 0.1 ETH (less for testing)
  const INITIAL_ZAMA = hre.ethers.utils.parseEther("10");  // 10 ZAMA tokens

  console.log("\n🚀 Initializing liquidity pool...\n");
  
  const signer = (await hre.ethers.getSigners())[0];
  console.log("📍 Signer:", signer.address);
  
  // Get contracts
  const fhedex = await hre.ethers.getContractAt("FHEDEX", FHEDEX_ADDRESS, signer);
  const zamaToken = await hre.ethers.getContractAt("IERC20", ZAMA_TOKEN, signer);
  
  // Check ZAMA balance
  const zamaBalance = await zamaToken.balanceOf(signer.address);
  console.log("💰 ZAMA Balance:", hre.ethers.utils.formatEther(zamaBalance), "ZAMA");
  
  if (zamaBalance.lt(INITIAL_ZAMA)) {
    console.log("❌ ERROR: Not enough ZAMA tokens!");
    console.log("   Need:", hre.ethers.utils.formatEther(INITIAL_ZAMA), "ZAMA");
    console.log("   Have:", hre.ethers.utils.formatEther(zamaBalance), "ZAMA");
    return;
  }
  
  // Approve ZAMA tokens for FHEDEX
  console.log("\n📝 Approving ZAMA tokens for FHEDEX...");
  const approveTx = await zamaToken.approve(FHEDEX_ADDRESS, INITIAL_ZAMA);
  await approveTx.wait();
  console.log("✅ Approved!");
  
  // Initialize pool
  console.log("\n🔄 Initializing pool with:");
  console.log("   ETH:", hre.ethers.utils.formatEther(INITIAL_ETH), "ETH");
  console.log("   ZAMA:", hre.ethers.utils.formatEther(INITIAL_ZAMA), "ZAMA");
  
  const initTx = await fhedex.initPool(INITIAL_ETH, INITIAL_ZAMA, {
    value: INITIAL_ETH,
    gasLimit: 1000000
  });
  
  const receipt = await initTx.wait();
  console.log("\n✅ Pool initialized!");
  console.log("📊 Transaction hash:", receipt.transactionHash);
  
  // Check pool state
  const reserves = await fhedex.getReserves();
  console.log("\n📈 Pool reserves (encrypted):");
  console.log("   ethReserve:", reserves[0].toString());
  console.log("   tokenReserve:", reserves[1].toString());
  
  console.log("\n🎉 Liquidity pool is now ACTIVE!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
