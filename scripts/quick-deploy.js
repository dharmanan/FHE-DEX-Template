const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('\n🚀 DEPLOYING TO SEPOLIA...\n');

  const [deployer] = await hre.ethers.getSigners();
  console.log('Deployer:', deployer.address);

  const network = await hre.ethers.provider.getNetwork();
  console.log('Network:', network.name, 'ChainID:', network.chainId);

  if (network.chainId !== 11155111) {
    throw new Error('This script is for Sepolia only (ChainID 11155111)');
  }

  // Deploy ZamaToken
  console.log('\n📦 Deploying ZamaToken...');
  const ZamaToken = await hre.ethers.getContractFactory('ZamaToken');
  const zamaToken = await ZamaToken.deploy();
  await zamaToken.deployed();
  console.log('✅ ZamaToken:', zamaToken.address);

  // Deploy FHEDEX
  console.log('\n📦 Deploying FHEDEX...');
  const FHEDEX = await hre.ethers.getContractFactory('FHEDEX');
  const fhedex = await FHEDEX.deploy(zamaToken.address);
  await fhedex.deployed();
  console.log('✅ FHEDEX:', fhedex.address);

  // Initialize pool
  console.log('\n📦 Initializing pool...');
  const tokenAmount = hre.ethers.utils.parseUnits('100', 18);
  const ethAmount = hre.ethers.utils.parseEther('1');

  // Approve
  await zamaToken.approve(fhedex.address, tokenAmount);
  console.log('✅ Token approved');

  // Initialize
  const tx = await fhedex.initializePool(tokenAmount, { value: ethAmount });
  await tx.wait();
  console.log('✅ Pool initialized');

  // Check reserves
  const reserves = await fhedex.getPoolReserves();
  console.log('ETH Reserve:', hre.ethers.utils.formatEther(reserves[0]));
  console.log('Token Reserve:', hre.ethers.utils.formatUnits(reserves[1], 18));

  // Save deployment
  const deployment = {
    network: 'sepolia',
    zamaToken: zamaToken.address,
    dex: fhedex.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, '..', 'deployments', 'sepolia-deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));
  console.log('\n✅ Deployment saved to:', deploymentPath);

  // Update .env.production
  const envPath = path.join(__dirname, '..', '.env.production');
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/VITE_ZAMA_TOKEN_ADDRESS=.*/, `VITE_ZAMA_TOKEN_ADDRESS=${zamaToken.address}`);
  envContent = envContent.replace(/VITE_DEX_ADDRESS=.*/, `VITE_DEX_ADDRESS=${fhedex.address}`);
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.production updated');

  console.log('\n📋 SUMMARY:');
  console.log('ZamaToken:', zamaToken.address);
  console.log('FHEDEX:   ', fhedex.address);
  console.log('\n✨ Deployment complete!\n');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
