const ethers = require("ethers");
require("dotenv").config();

const OLD_DEX = "0xc7a8884fa733510A3A1C7021e38Dd053dDb75e41";

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const DEX_ABI = [
  "function removeLiquidity(uint256 lpAmount) external",
  "function userLiquidity(address) view returns (uint256)"
];

async function recoverOldLP() {
  console.log("Recovering LP from old contract:", OLD_DEX);
  
  const oldDex = new ethers.Contract(OLD_DEX, DEX_ABI, wallet);
  
  // Check LP balance
  const lpBalance = await oldDex.userLiquidity(wallet.address);
  console.log("Your LP:", ethers.formatUnits(lpBalance, 18));
  
  if (lpBalance > 0n) {
    console.log("Withdrawing all LP...");
    const tx = await oldDex.removeLiquidity(lpBalance);
    console.log("Tx hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✓ Withdrawal confirmed!");
    
    // Check new balances
    const ethBalance = await provider.getBalance(wallet.address);
    console.log("\nNew wallet balance:", ethers.formatEther(ethBalance), "ETH");
  }
}

recoverOldLP().catch(console.error);
