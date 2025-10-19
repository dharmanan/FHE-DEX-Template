const hre = require('hardhat');
const { ethers } = hre;

async function main() {
  const DEX_ADDRESS = "0xC06dFa845A5aAE13a666D48234d81176535AeBdD";
  const TOKEN_ADDRESS = "0x9fa47046C88F45A29c5b60d6B01aB68281128138";
  
  const provider = new ethers.providers.JsonRpcProvider("https://eth-sepolia.public.blastapi.io");
  
  // Get DEX ABI
  const fs = require('fs');
  const dexAbi = JSON.parse(fs.readFileSync('./src/abi/DEX.json', 'utf8'));
  
  const dex = new ethers.Contract(DEX_ADDRESS, dexAbi, provider);
  
  console.log("📊 Checking contract state...\n");
  
  try {
    const reserves = await dex.getPoolReserves();
    console.log("✅ Pool Reserves:");
    console.log("   ETH:", ethers.utils.formatEther(reserves.ethBalance || reserves[0]));
    console.log("   Token:", ethers.utils.formatUnits(reserves.tokenBalance || reserves[1], 18));
  } catch (e) {
    console.log("❌ getPoolReserves error:", e.message);
  }
  
  try {
    const totalLiq = await dex.getTotalLiquidity();
    console.log("✅ Total Liquidity:", ethers.utils.formatUnits(totalLiq, 18));
  } catch (e) {
    console.log("❌ getTotalLiquidity error:", e.message);
  }
  
  try {
    const ethBal = await provider.getBalance(DEX_ADDRESS);
    console.log("✅ Contract ETH Balance:", ethers.utils.formatEther(ethBal));
  } catch (e) {
    console.log("❌ ETH balance error:", e.message);
  }
}

main().catch(console.error);
