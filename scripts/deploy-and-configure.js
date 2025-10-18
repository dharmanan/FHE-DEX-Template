/**
 * Deploy to Zama Testnet AND Update Frontend Config
 * 
 * This script:
 * 1. Deploys contracts to Zama testnet
 * 2. Saves addresses
 * 3. Updates .env.production with real addresses
 * 4. Shows you exactly what to push to git
 */

const hre = require('hardhat');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                  🚀 DEPLOY TO ZAMA TESTNET + CONFIGURE             ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deployer Account:', deployer.address);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log('🌐 Network:', network.name, 'ChainID:', network.chainId);
  
  // Allow both Zama (8008) and Sepolia (11155111) for testing
  if (network.chainId !== 8008 && network.chainId !== 11155111) {
    console.error('❌ ERROR: This script is for Zama testnet (8008) or Sepolia (11155111) only!');
    console.error('   Current chain ID:', network.chainId);
    process.exit(1);
  }
  
  if (network.chainId === 11155111) {
    console.log('⚠️  WARNING: Deploying to Sepolia (testing only - FHE features not available)');
  }

  console.log('\n───────────────────────────────────────────────────────────────────\n');

  // Step 1: Deploy ZamaToken
  console.log('📦 Step 1: Deploying ZamaToken...');
  const ZamaToken = await ethers.getContractFactory('ZamaToken');
  const zamaToken = await ZamaToken.deploy();
  await zamaToken.deployed();
  const zamaTokenAddress = zamaToken.address;
  console.log('✅ ZamaToken deployed at:', zamaTokenAddress);
  console.log('   TX:', zamaToken.deployTransaction.hash);

  // Step 2: Deploy FHEDEX
  console.log('\n📦 Step 2: Deploying FHEDEX...');
  const FHEDEX = await ethers.getContractFactory('FHEDEX');
  const fhedex = await FHEDEX.deploy(zamaTokenAddress);
  await fhedex.deployed();
  const fhedexAddress = fhedex.address;
  console.log('✅ FHEDEX deployed at:', fhedexAddress);
  console.log('   TX:', fhedex.deployTransaction.hash);

  // Step 3: Initialize Pool
  console.log('\n📦 Step 3: Initializing Pool...');
  const initialTokenAmount = ethers.utils.parseUnits('1000', 18);
  const initialEthAmount = ethers.utils.parseEther('10');

  // Approve tokens
  console.log('   ├─ Approving tokens...');
  const approveTx = await zamaToken.approve(fhedexAddress, initialTokenAmount);
  await approveTx.wait();
  console.log('   ├─ ✅ Approved 1000 ZAMA tokens');

  // Initialize pool
  console.log('   ├─ Initializing pool...');
  const initTx = await fhedex.initializePool(initialTokenAmount, {
    value: initialEthAmount,
  });
  await initTx.wait();
  console.log('   ├─ ✅ Pool initialized');

  // Verify pool
  console.log('   └─ Verifying pool...');
  const reserves = await fhedex.getPoolReserves();
  console.log('       ETH Reserve:', ethers.utils.formatEther(reserves[0]), 'ETH');
  console.log('       Token Reserve:', ethers.utils.formatUnits(reserves[1], 18), 'ZAMA');

  console.log('\n───────────────────────────────────────────────────────────────────\n');

  // Step 4: Save deployment info
  console.log('💾 Step 4: Saving Deployment Info...');
  
  const deploymentInfo = {
    network: 'Zama FHEVM Testnet',
    chainId: 8008,
    rpc: 'https://testnet-rpc.zama.ai:8545',
    explorer: 'https://testnet-explorer.zama.ai',
    deployer: deployer.address,
    zamaToken: zamaTokenAddress,
    fhedex: fhedexAddress,
    deployedAt: new Date().toISOString(),
    initialLiquidity: {
      eth: ethers.utils.formatEther(initialEthAmount),
      tokens: ethers.utils.formatUnits(initialTokenAmount, 18),
    },
  };

  // Save to file
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filePath = path.join(deploymentsDir, 'zama-testnet-deployment.json');
  fs.writeFileSync(filePath, JSON.stringify(deploymentInfo, null, 2));
  console.log('✅ Saved to:', filePath);

  // Step 5: Update .env.production
  console.log('\n📝 Step 5: Updating .env.production...');
  
  const envPath = path.join(__dirname, '..', '.env.production');
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update addresses
  envContent = envContent.replace(
    /VITE_ZAMA_TOKEN_ADDRESS=.*/,
    `VITE_ZAMA_TOKEN_ADDRESS=${zamaTokenAddress}`
  );
  envContent = envContent.replace(
    /VITE_DEX_ADDRESS=.*/,
    `VITE_DEX_ADDRESS=${fhedexAddress}`
  );

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Updated .env.production with contract addresses');

  console.log('\n═══════════════════════════════════════════════════════════════════\n');
  console.log('✨ DEPLOYMENT COMPLETE!\n');

  console.log('📋 CONTRACT ADDRESSES:');
  console.log('   ZamaToken:', zamaTokenAddress);
  console.log('   FHEDEX:   ', fhedexAddress);

  console.log('\n🔗 VERCEL CONFIGURATION:');
  console.log('   Add these environment variables to Vercel:');
  console.log('   ├─ VITE_ZAMA_TOKEN_ADDRESS=' + zamaTokenAddress);
  console.log('   └─ VITE_DEX_ADDRESS=' + fhedexAddress);

  console.log('\n📤 NEXT STEPS:');
  console.log('   1. Verify contracts on explorer:');
  console.log('      https://testnet-explorer.zama.ai/address/' + zamaTokenAddress);
  console.log('      https://testnet-explorer.zama.ai/address/' + fhedexAddress);
  console.log('');
  console.log('   2. Push to git:');
  console.log('      git add .env.production deployments/');
  console.log('      git commit -m "🚀 Deploy ZAMA DEX to Testnet"');
  console.log('      git push origin main');
  console.log('');
  console.log('   3. Vercel will redeploy automatically');
  console.log('      Your frontend will connect to these contracts!');

  console.log('\n═══════════════════════════════════════════════════════════════════\n');

  // Return for testing
  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
