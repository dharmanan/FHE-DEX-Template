const ethers = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const DEX = "0xa013B92c201F4A9BD732615c60FAfb2d2EFba87E";

const DEX_ABI = [
  "function userLiquidity(address) view returns (uint256)",
  "function totalLiquidity() view returns (uint256)",
  "function removeLiquidity(uint256 lpAmount) external"
];

async function test() {
  const dex = new ethers.Contract(DEX, DEX_ABI, wallet);
  
  const lpBal = await dex.userLiquidity(wallet.address);
  const totalLP = await dex.totalLiquidity();
  
  console.log("Your LP:", ethers.formatUnits(lpBal, 18));
  console.log("Total LP:", ethers.formatUnits(totalLP, 18));
  
  if (lpBal > 0n) {
    console.log("\nAttempting to remove 0.1 LP tokens...");
    const amount = ethers.parseUnits("0.1", 18);
    try {
      const tx = await dex.removeLiquidity(amount);
      console.log("Tx hash:", tx.hash);
      const receipt = await tx.wait();
      console.log("✓ Success!");
      console.log("Gas used:", receipt.gasUsed.toString());
    } catch (err) {
      console.log("✗ Failed:", err.message);
    }
  }
}

test().catch(console.error);
