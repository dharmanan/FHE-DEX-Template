const ethers = require("ethers");
require("dotenv").config();

const OLD_DEX = "0xc7a8884fa733510A3A1C7021e38Dd053dDb75e41";
const OLD_ZAMA = "0x2080Db70a9490Eb7E3d7C5ebD58C36F58CE908A1";

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);

async function checkOldLiquidity() {
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log("Checking old contract liquidity for:", wallet.address);
  
  // Check old contract ETH balance
  const ethBalance = await provider.getBalance(OLD_DEX);
  console.log("Old DEX ETH:", ethers.formatEther(ethBalance));
  
  // Check old contract TOKEN balance
  const zamaABI = [
    "function balanceOf(address) view returns (uint256)"
  ];
  const zamaToken = new ethers.Contract(OLD_ZAMA, zamaABI, provider);
  const tokenBalance = await zamaToken.balanceOf(OLD_DEX);
  console.log("Old DEX TOKEN:", ethers.formatUnits(tokenBalance, 18));
  
  // Check if user has LP in old contract
  const dexABI = [
    "function userLiquidity(address) view returns (uint256)"
  ];
  const oldDex = new ethers.Contract(OLD_DEX, dexABI, provider);
  const lpBalance = await oldDex.userLiquidity(wallet.address);
  console.log("Your LP in old contract:", ethers.formatUnits(lpBalance, 18));
}

checkOldLiquidity().catch(console.error);
