const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Starting contract deployment...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // ZamaToken'ı deploy et
  console.log("\n1. Deploying ZamaToken...");
  const zamaTokenFactory = await hre.ethers.getContractFactory("ZamaToken");
  const zamaToken = await zamaTokenFactory.deploy(deployer.address);
  await zamaToken.deployed();
  const tokenAddress = zamaToken.address;
  console.log(`✓ ZamaToken deployed to: ${tokenAddress}`);

  // DEX'i deploy et
  console.log("\n2. Deploying DEX...");
  const dexFactory = await hre.ethers.getContractFactory("DEX");
  const dex = await dexFactory.deploy(tokenAddress);
  await dex.deployed();
  const dexAddress = dex.address;
  console.log(`✓ DEX deployed to: ${dexAddress}`);

  // Deployment info'yu kaydet
  const deploymentInfo = {
    network: hre.network.name,
    zamaToken: tokenAddress,
    dex: dexAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  const fileName = `deployments/${hre.network.name}-deployment.json`;
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }
  fs.writeFileSync(fileName, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n✓ Deployment info saved to: ${fileName}`);

  console.log("\n=== Deployment Summary ===");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`ZamaToken: ${tokenAddress}`);
  console.log(`DEX: ${dexAddress}`);
  console.log(`Deployer: ${deployer.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


