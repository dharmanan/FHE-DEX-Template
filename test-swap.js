const ethers = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const DEX = "0x52e1F9F6F9d51F5640A221061d3ACf5FEa3398Be";
const ZAMA_TOKEN = "0x3630d67C78A3da51549e8608C17883Ea481D817F";

const DEX_ABI = ["function swapEthForToken() external payable"];
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)"
];

async function test() {
  const dex = new ethers.Contract(DEX, DEX_ABI, wallet);
  const token = new ethers.Contract(ZAMA_TOKEN, TOKEN_ABI, wallet);
  
  console.log("=== SWAP TEST ===\n");
  
  // Get initial balances
  const ethBefore = await provider.getBalance(wallet.address);
  const tokenBefore = await token.balanceOf(wallet.address);
  
  console.log("Before:");
  console.log("ETH:", ethers.formatEther(ethBefore));
  console.log("TOKEN:", ethers.formatUnits(tokenBefore, 18));
  
  // Swap 0.01 ETH for TOKEN
  console.log("\nSwapping 0.01 ETH...");
  const swapTx = await dex.swapEthForToken({
    value: ethers.parseEther("0.01")
  });
  const receipt = await swapTx.wait();
  console.log("✓ Swap completed (gas:", receipt.gasUsed.toString(), ")");
  
  // Get final balances
  const ethAfter = await provider.getBalance(wallet.address);
  const tokenAfter = await token.balanceOf(wallet.address);
  
  console.log("\nAfter:");
  console.log("ETH:", ethers.formatEther(ethAfter));
  console.log("TOKEN:", ethers.formatUnits(tokenAfter, 18));
  
  console.log("\nDifference:");
  console.log("ETH spent:", ethers.formatEther(ethBefore - ethAfter));
  console.log("TOKEN gained:", ethers.formatUnits(tokenAfter - tokenBefore, 18));
}

test().catch(console.error);
