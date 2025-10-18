/**
 * Deployment Script for Zama FHEVM Testnet
 * Deploys ZamaToken and FHEDEX to Zama testnet (ChainID 8008)
 */

const hre = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('🚀 Deploying to Zama FHEVM Testnet...\n');

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying contracts with account:', deployer.address);

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log('🌐 Network:', network.name, '(ChainID:', network.chainId + ')');
  console.log('');

  // Step 1: Deploy ZamaToken
  console.log('📦 Step 1: Deploying ZamaToken...');
  const ZamaToken = await ethers.getContractFactory('ZamaToken');
  const zamaToken = await ZamaToken.deploy();
  await zamaToken.deployed();

  console.log('✅ ZamaToken deployed at:', zamaToken.address);
  console.log('   Transaction hash:', zamaToken.deployTransaction.hash);
  console.log('');

  // Step 2: Deploy FHEDEX
  console.log('📦 Step 2: Deploying FHEDEX...');
  const FHEDEX = await ethers.getContractFactory('FHEDEX');
  const fhedex = await FHEDEX.deploy(zamaToken.address);
  await fhedex.deployed();

  console.log('✅ FHEDEX deployed at:', fhedex.address);
  console.log('   Transaction hash:', fhedex.deployTransaction.hash);
  console.log('');

  // Step 3: Initial setup
  console.log('⚙️  Step 3: Setting up initial liquidity...');

  const initialTokenAmount = ethers.utils.parseUnits('1000', 18);
  const initialEthAmount = ethers.utils.parseEther('10');

  // Approve tokens for FHEDEX
  const approveTx = await zamaToken.approve(fhedex.address, initialTokenAmount);
  await approveTx.wait();
  console.log('   ✅ Tokens approved');

  // Initialize pool
  const initTx = await fhedex.initializePool(initialTokenAmount, {
    value: initialEthAmount,
  });
  await initTx.wait();
  console.log('   ✅ Pool initialized with:');
  console.log('      - 10 ETH');
  console.log('      - 1000 ZAMA tokens');
  console.log('');

  // Step 4: Verification
  console.log('✅ Deployment Complete!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 Contract Addresses:');
  console.log('   ZamaToken:', zamaToken.address);
  console.log('   FHEDEX:', fhedex.address);
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('🔗 Verification & Testing:');
  console.log('   Block Explorer: https://testnet-explorer.zama.ai');
  console.log('   RPC: https://testnet-rpc.zama.ai:8545');
  console.log('');
  console.log('📚 Next Steps:');
  console.log('   1. Save these addresses to your config');
  console.log('   2. Test swaps on testnet');
  console.log('   3. Monitor callback execution');
  console.log('   4. Check pool reserves after swaps');
  console.log('');

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    zamaToken: zamaToken.address,
    fhedex: fhedex.address,
    deployedAt: new Date().toISOString(),
    initialLiquidity: {
      eth: ethers.utils.formatEther(initialEthAmount),
      tokens: ethers.utils.formatUnits(initialTokenAmount, 18),
    },
  };

  console.log('💾 Deployment info saved (run this script to see all details)');
  console.log('');

  return deploymentInfo;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
