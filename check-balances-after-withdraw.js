const ethers = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const DEX = "0xa013B92c201F4A9BD732615c60FAfb2d2EFba87E";
const ZAMA_TOKEN = "0xac6763AdE771B464d70eb7d46Eb4bd31F5b1c76F";

async function checkBalances() {
  console.log("User:", wallet.address);
  
  // ETH balance
  const ethBal = await provider.getBalance(wallet.address);
  console.log("ETH:", ethers.formatEther(ethBal));
  
  // TOKEN balance
  const tokenABI = ["function balanceOf(address) view returns (uint256)"];
  const token = new ethers.Contract(ZAMA_TOKEN, tokenABI, provider);
  const tokenBal = await token.balanceOf(wallet.address);
  console.log("TOKEN:", ethers.formatUnits(tokenBal, 18));
  
  // DEX state
  const dexABI = [
    "function userLiquidity(address) view returns (uint256)",
    "function totalLiquidity() view returns (uint256)"
  ];
  const dex = new ethers.Contract(DEX, dexABI, provider);
  const userLP = await dex.userLiquidity(wallet.address);
  const totalLP = await dex.totalLiquidity();
  console.log("Your LP:", ethers.formatUnits(userLP, 18));
  console.log("Total LP:", ethers.formatUnits(totalLP, 18));
}

checkBalances().catch(console.error);
