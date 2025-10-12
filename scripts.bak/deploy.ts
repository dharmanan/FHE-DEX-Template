const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // ZamaToken'ı deploy et
  const zamaTokenFactory = await hre.ethers.getContractFactory("ZamaToken");
  const zamaToken = await zamaTokenFactory.deploy(deployer.address);
  await zamaToken.deployed();
  const tokenAddress = zamaToken.address;
  console.log(`ZamaToken deployed to: ${tokenAddress}`);

  // DEX'i deploy et
  const dexFactory = await hre.ethers.getContractFactory("DEX");
  const dex = await dexFactory.deploy(tokenAddress);
  await dex.deployed();
  const dexAddress = dex.address;
  console.log(`DEX deployed to: ${dexAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
