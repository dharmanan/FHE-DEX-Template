const ethers = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

async function verify() {
  const DEX = "0xa013B92c201F4A9BD732615c60FAfb2d2EFba87E";
  const ZAMA_TOKEN = "0xac6763AdE771B464d70eb7d46Eb4bd31F5b1c76F";
  
  console.log("=== Verifying Contract State ===\n");
  
  // Check DEX token property
  const dexABI = ["function token() view returns (address)"];
  const dex = new ethers.Contract(DEX, dexABI, provider);
  const tokenInDex = await dex.token();
  console.log("DEX.token() returns:", tokenInDex);
  console.log("Expected ZAMA:", ZAMA_TOKEN);
  console.log("Match:", tokenInDex.toLowerCase() === ZAMA_TOKEN.toLowerCase() ? "✓" : "✗");
  
  // Check DEX ETH balance
  const ethBalance = await provider.getBalance(DEX);
  console.log("\nDEX ETH balance:", ethers.formatEther(ethBalance));
  
  // Check DEX TOKEN balance
  const tokenABI = ["function balanceOf(address) view returns (uint256)"];
  const token = new ethers.Contract(ZAMA_TOKEN, tokenABI, provider);
  const tokenBalance = await token.balanceOf(DEX);
  console.log("DEX TOKEN balance:", ethers.formatUnits(tokenBalance, 18));
}

verify().catch(console.error);
