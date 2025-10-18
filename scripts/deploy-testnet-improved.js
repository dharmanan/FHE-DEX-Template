/**
 * Improved Deployment Script for Zama FHEVM Testnet
 * With detailed logging and error handling
 * Deploys ZamaToken and FHEDEX with explicit pool initialization
 */

const hre = require('hardhat');
require('dotenv').config();
const fs = require('fs');

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  🚀 IMPROVED ZAMA FHEDEX DEPLOYMENT WITH LIQUIDITY      ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log('📝 Deployer Account:', deployer.address);
    
    // Get deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 Deployer Balance:', ethers.utils.formatEther(balance), 'ETH\n');

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log('🌐 Network Configuration:');
    console.log('   Name:', network.name);
    console.log('   Chain ID:', network.chainId);
    console.log('   Expected: 8008 (Zama FHEVM)\n');

    // ════════════════════════════════════════════════════════════
    // STEP 1: Deploy ZamaToken
    // ════════════════════════════════════════════════════════════
    console.log('📦 STEP 1: Deploying ZamaToken...');
    const ZamaToken = await ethers.getContractFactory('ZamaToken');
    const zamaToken = await ZamaToken.deploy();
    await zamaToken.deployed();

    console.log('   ✅ Deployed at:', zamaToken.address);
    console.log('   📋 Tx Hash:', zamaToken.deployTransaction.hash);

    // Check initial supply
    const totalSupply = await zamaToken.totalSupply();
    console.log('   💎 Total Supply:', ethers.utils.formatUnits(totalSupply, 18), 'ZAMA');

    // Check deployer balance
    const deployerBalance = await zamaToken.balanceOf(deployer.address);
    console.log('   👤 Deployer Balance:', ethers.utils.formatUnits(deployerBalance, 18), 'ZAMA\n');

    // ════════════════════════════════════════════════════════════
    // STEP 2: Deploy FHEDEX
    // ════════════════════════════════════════════════════════════
    console.log('📦 STEP 2: Deploying FHEDEX...');
    const FHEDEX = await ethers.getContractFactory('FHEDEX');
    const fhedex = await FHEDEX.deploy(zamaToken.address);
    await fhedex.deployed();

    console.log('   ✅ Deployed at:', fhedex.address);
    console.log('   📋 Tx Hash:', fhedex.deployTransaction.hash);
    console.log('   🔗 Token Address Set:', zamaToken.address, '\n');

    // ════════════════════════════════════════════════════════════
    // STEP 3: Approve Tokens
    // ════════════════════════════════════════════════════════════
    console.log('⚙️  STEP 3: Approving Tokens for FHEDEX...');

    const initialTokenAmount = ethers.utils.parseUnits('1000', 18);
    const initialEthAmount = ethers.utils.parseEther('10');

    console.log('   📤 Approving', ethers.utils.formatUnits(initialTokenAmount, 18), 'ZAMA');
    console.log('   📤 For:', fhedex.address);

    const approveTx = await zamaToken.approve(fhedex.address, initialTokenAmount);
    console.log('   ⏳ Waiting for approval...');
    const approveReceipt = await approveTx.wait();

    if (!approveReceipt) {
      throw new Error('❌ Approval transaction failed or was reverted');
    }

    console.log('   ✅ Approval successful!');
    console.log('   📋 Tx Hash:', approveTx.hash);
    console.log('   ⛽ Gas Used:', approveReceipt.gasUsed.toString(), '\n');

    // ════════════════════════════════════════════════════════════
    // STEP 4: Initialize Pool with Liquidity
    // ════════════════════════════════════════════════════════════
    console.log('💧 STEP 4: Initializing Pool with Liquidity...');
    console.log('   📊 Initial Liquidity:');
    console.log('      ETH:', ethers.utils.formatEther(initialEthAmount));
    console.log('      ZAMA:', ethers.utils.formatUnits(initialTokenAmount, 18));
    console.log('   ⏳ Sending transaction with explicit gas limit...');

    const initTx = await fhedex.initializePool(initialTokenAmount, {
      value: initialEthAmount,
      gasLimit: 5000000, // Explicit gas limit
    });

    console.log('   ⏳ Waiting for pool initialization...');
    const initReceipt = await initTx.wait();

    if (!initReceipt) {
      throw new Error('❌ Pool initialization failed or was reverted');
    }

    console.log('   ✅ Pool Initialized Successfully!');
    console.log('   📋 Tx Hash:', initTx.hash);
    console.log('   ⛽ Gas Used:', initReceipt.gasUsed.toString(), '\n');

    // ════════════════════════════════════════════════════════════
    // STEP 5: Verify Pool State
    // ════════════════════════════════════════════════════════════
    console.log('🔍 STEP 5: Verifying Pool State...\n');

    // Get pool reserves
    const reserves = await fhedex.getPoolReserves();
    console.log('   📦 Pool Reserves:');
    console.log('      ETH Reserve:', ethers.utils.formatEther(reserves[0]));
    console.log('      Token Reserve:', ethers.utils.formatUnits(reserves[1], 18));

    // Get total liquidity
    const totalLiquidity = await fhedex.totalLiquidity();
    console.log('   💧 Total Liquidity:', ethers.utils.formatUnits(totalLiquidity, 18), 'LP');

    // Get user liquidity
    const userLiquidity = await fhedex.userLiquidity(deployer.address);
    console.log('   👤 Your Liquidity:', ethers.utils.formatUnits(userLiquidity, 18), 'LP\n');

    // ════════════════════════════════════════════════════════════
    // STEP 6: Save Deployment Info
    // ════════════════════════════════════════════════════════════
    const deploymentInfo = {
      timestamp: new Date().toISOString(),
      network: {
        name: network.name,
        chainId: network.chainId,
        rpc: 'https://testnet-rpc.zama.ai:8545',
        explorer: 'https://testnet-explorer.zama.ai',
      },
      deployer: deployer.address,
      contracts: {
        zamaToken: {
          address: zamaToken.address,
          deploymentTx: zamaToken.deployTransaction.hash,
          totalSupply: ethers.utils.formatUnits(totalSupply, 18),
        },
        fhedex: {
          address: fhedex.address,
          deploymentTx: fhedex.deployTransaction.hash,
        },
      },
      poolState: {
        ethReserve: ethers.utils.formatEther(reserves[0]),
        tokenReserve: ethers.utils.formatUnits(reserves[1], 18),
        totalLiquidity: ethers.utils.formatUnits(totalLiquidity, 18),
        userLiquidity: ethers.utils.formatUnits(userLiquidity, 18),
      },
      transactions: {
        approve: approveTx.hash,
        initialize: initTx.hash,
      },
    };

    // Save to JSON file
    const outputFile = `./deployments/zama-testnet-deployment-${Date.now()}.json`;
    fs.writeFileSync(outputFile, JSON.stringify(deploymentInfo, null, 2));
    console.log('   💾 Deployment info saved to:', outputFile, '\n');

    // ════════════════════════════════════════════════════════════
    // FINAL SUMMARY
    // ════════════════════════════════════════════════════════════
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║           ✅ DEPLOYMENT SUCCESSFUL & VERIFIED          ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('📋 Contract Addresses:');
    console.log('   ZamaToken:', zamaToken.address);
    console.log('   FHEDEX:   ', fhedex.address);
    console.log('');

    console.log('💧 Pool Status:');
    console.log('   ETH Reserve:    ', ethers.utils.formatEther(reserves[0]), 'ETH');
    console.log('   Token Reserve:  ', ethers.utils.formatUnits(reserves[1], 18), 'ZAMA');
    console.log('   Total Liquidity:', ethers.utils.formatUnits(totalLiquidity, 18), 'LP');
    console.log('');

    console.log('🔗 Explorer Links:');
    console.log('   ZamaToken:  https://testnet-explorer.zama.ai/address/', zamaToken.address);
    console.log('   FHEDEX:     https://testnet-explorer.zama.ai/address/', fhedex.address);
    console.log('');

    console.log('📚 Next Steps:');
    console.log('   1. Verify on explorer (should show ETH and tokens)');
    console.log('   2. Test swaps on testnet');
    console.log('   3. Monitor Oracle callbacks');
    console.log('   4. Check pool reserves after swaps');
    console.log('');

    return deploymentInfo;

  } catch (error) {
    console.error('\n❌ ERROR DURING DEPLOYMENT:\n');
    console.error('Message:', error.message);
    console.error('\nFull Error:', error);

    console.error('\n⚠️  Troubleshooting:\n');
    console.error('   1. Check .env file has PRIVATE_KEY');
    console.error('   2. Ensure you have enough test ETH on Zama testnet');
    console.error('   3. Check network connection to testnet-rpc.zama.ai:8545');
    console.error('   4. Run: npm test (to verify contracts compile)');
    console.error('');

    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
