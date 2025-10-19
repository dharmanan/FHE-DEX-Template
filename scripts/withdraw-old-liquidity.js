const { ethers } = require("ethers");
require("dotenv").config();

// Eski kontrat adresleri
const OLD_CONTRACTS = [
  { address: "0xC06dFa845A5aAE13a666D48234d81176535AeBdD", name: "Kontrat 1 (1 ETH + 100 ZAMA)" },
  { address: "0x692d6313d06cABDbaCa19d7cD1Aba3f08B1E180C", name: "Kontrat 2 (0.5 ETH + 5000 ZAMA)" },
  { address: "0x42972a46781C41AB51b82B6BF425c9483BeC25e3", name: "Kontrat 3 (Yeni)" }
];

const RPC_URL = "https://eth-sepolia.public.blastapi.io";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const privateKey = process.env.PRIVATE_KEY;
const wallet = new ethers.Wallet(privateKey, provider);

// Basit FHEDEX ABI (removeLiquidity için yeterli)
const FHEDEX_ABI = [
  "function removeLiquidity(uint256 lpAmount) external",
  "function getLPBalance(address user) external view returns (uint256)",
  "function getPendingSwap(uint256 requestId) external view returns (address user, uint256 inputAmount, string memory direction, bool completed)",
  "function getPoolReserves() external view returns (uint256 ethBalance, uint256 tokenBalance)"
];

async function checkAndWithdraw() {
  console.log("Eski kontratlardan LP token çıkarılıyor...\n");
  console.log("Wallet:", wallet.address);
  console.log("Balance:", (await provider.getBalance(wallet.address)).toString(), "\n");

  let totalETHWithdrawn = 0n;

  for (const oldContract of OLD_CONTRACTS) {
    console.log(`\n=== ${oldContract.name} ===`);
    console.log("Address:", oldContract.address);

    try {
      const contract = new ethers.Contract(oldContract.address, FHEDEX_ABI, wallet);

      // LP balance kontrol et
      const lpBalance = await contract.getLPBalance(wallet.address);
      console.log("LP Balance:", lpBalance.toString());

      if (lpBalance > 0n) {
        console.log("Withdrawing...");
        const tx = await contract.removeLiquidity(lpBalance);
        console.log("Tx hash:", tx.hash);
        const receipt = await tx.wait();
        console.log("✓ Withdrawn successfully");
        console.log("Gas used:", receipt.gasUsed.toString());
      } else {
        console.log("No LP tokens to withdraw");
      }

      // Pool reserves kontrol et
      try {
        const reserves = await contract.getPoolReserves();
        console.log("Pool ETH:", ethers.formatEther(reserves[0]), "ETH");
        console.log("Pool Tokens:", ethers.formatUnits(reserves[1], 18), "ZAMA");
      } catch (e) {
        // Silence
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  }

  console.log("\n=== Final Balance ===");
  const finalBalance = await provider.getBalance(wallet.address);
  console.log("ETH:", ethers.formatEther(finalBalance), "ETH");
}

checkAndWithdraw()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
