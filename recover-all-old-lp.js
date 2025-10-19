const ethers = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const OLD_CONTRACTS = [
  "0xc7a8884fa733510A3A1C7021e38Dd053dDb75e41",
  "0xa013B92c201F4A9BD732615c60FAfb2d2EFba87E"
];

const DEX_ABI = [
  "function removeLiquidity(uint256 lpAmount) external",
  "function userLiquidity(address) view returns (uint256)"
];

async function recoverAll() {
  for (const dexAddr of OLD_CONTRACTS) {
    const dex = new ethers.Contract(dexAddr, DEX_ABI, wallet);
    const lpBal = await dex.userLiquidity(wallet.address);
    
    if (lpBal > 0n) {
      console.log(`\n[${dexAddr}]`);
      console.log("Your LP:", ethers.formatUnits(lpBal, 18));
      console.log("Withdrawing...");
      
      try {
        const tx = await dex.removeLiquidity(lpBal);
        const receipt = await tx.wait();
        console.log("✓ Success!");
      } catch (err) {
        console.log("✗ Error:", err.message);
      }
    }
  }
  
  const ethBalance = await provider.getBalance(wallet.address);
  console.log("\nFinal wallet ETH:", ethers.formatEther(ethBalance));
}

recoverAll().catch(console.error);
