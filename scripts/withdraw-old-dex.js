const hre = require("hardhat");

async function main() {
  console.log("💸 Withdrawing ETH from old DEX contract...\n");

  const OLD_DEX_ADDRESS = "0x1F1B2d3BDCe3674164eD34F1313a62486764CD19";
  
  try {
    const [signer] = await hre.ethers.getSigners();
    const signerAddress = await signer.getAddress();
    
    console.log(`🔑 Signer address: ${signerAddress}`);
    console.log(`📍 Old DEX address: ${OLD_DEX_ADDRESS}`);

    // Get current ETH balance in old contract
    const balance = await hre.ethers.provider.getBalance(OLD_DEX_ADDRESS);
    const balanceInETH = hre.ethers.utils.formatEther(balance);
    
    console.log(`\n💰 ETH in old DEX: ${balanceInETH} ETH`);
    
    if (balanceInETH === "0.0") {
      console.log("❌ No ETH in old contract");
      return;
    }

    // Get the old DEX ABI
    const DEX = await hre.ethers.getContractFactory("DEX");
    const oldDex = DEX.attach(OLD_DEX_ADDRESS);

    console.log("\n🔓 Calling withdraw function...");
    
    // Check if we have LP tokens
    const userLiquidity = await oldDex.liquidity(signerAddress);
    console.log(`📊 Your LP tokens: ${hre.ethers.utils.formatEther(userLiquidity)} ZAMA`);

    if (userLiquidity.isZero()) {
      console.log("❌ No LP tokens to withdraw");
      return;
    }

    // Withdraw all liquidity
    const tx = await oldDex.withdraw(userLiquidity, {
      gasLimit: 500000,
    });

    console.log(`\n⏳ Withdrawal transaction hash: ${tx.hash}`);
    await tx.wait();

    console.log("✅ Withdrawal complete!");

    // Check new balance
    const newBalance = await signer.getBalance();
    const newBalanceInETH = hre.ethers.utils.formatEther(newBalance);
    console.log(`\n💳 New wallet balance: ${newBalanceInETH} ETH`);

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exitCode = 1;
  }
}

main();
