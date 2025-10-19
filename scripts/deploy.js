const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Starting Zama FHEVM DEX deployment...\n");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  // ZamaToken'ı deploy et
  console.log("\n1. Deploying ZamaToken...");
  const ZamaToken = await hre.ethers.getContractFactory("ZamaToken");
  const zamaToken = await ZamaToken.deploy();
  const zamaTokenDeployed = await zamaToken.waitForDeployment();
  const tokenAddress = await zamaTokenDeployed.getAddress();
  console.log(`✓ ZamaToken deployed to: ${tokenAddress}`);

  // FHEDEX'i deploy et
  console.log("\n2. Deploying FHEDEX...");
  const FHEDEX = await hre.ethers.getContractFactory("FHEDEX");
  const fhedex = await FHEDEX.deploy(tokenAddress);
  const fhedexDeployed = await fhedex.waitForDeployment();
  const fhedexAddress = await fhedexDeployed.getAddress();
  console.log(`✓ FHEDEX deployed to: ${fhedexAddress}`);

  // Deployment info'yu kaydet
  const network = await deployer.provider.getNetwork();
  const deploymentInfo = {
    network: hre.network.name,
    chainId: network.chainId,
    zamaToken: tokenAddress,
    fhedex: fhedexAddress,
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
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`ZamaToken: ${tokenAddress}`);
  console.log(`FHEDEX: ${fhedexAddress}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Timestamp: ${deploymentInfo.timestamp}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


