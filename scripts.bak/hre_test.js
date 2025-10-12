const hre = require("hardhat");

async function main() {
  if (!hre.ethers) {
    console.error("hre.ethers YOK! Hardhat plugin yüklenmiyor.");
    process.exit(1);
  }
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deployer adresi:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
