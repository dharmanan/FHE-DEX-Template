const hre = require("hardhat");

async function main() {
  const ZAMA_TOKEN = "0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636";

  console.log("Deploying FHEDEX with real FHE...");

  const FHEDEX = await hre.ethers.getContractFactory("FHEDEX");
  
  const fhedex = await FHEDEX.deploy(ZAMA_TOKEN, {
    gasLimit: 5000000
  });
  
  await fhedex.deployed();

  console.log("✨✨✨ GERÇEK FHE FHEDEX DEPLOYED ✨✨✨");
  console.log("Address:", fhedex.address);
  console.log("Network: Sepolia");
  console.log("\nFHE Operations:");
  console.log("- ethReserve: euint32 (encrypted)");
  console.log("- tokenReserve: euint32 (encrypted)");
  console.log("- Swap hesaplamaları: FHE.mul(), FHE.add(), FHE.div() homomorphic");
  console.log("- Deposit/Withdraw: FHE.add(), FHE.sub()");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
