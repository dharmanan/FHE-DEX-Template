/**
 * Check Pool State on Zama FHEVM Testnet
 * Queries deployed contracts and checks liquidity status
 */

const hre = require('hardhat');
require('dotenv').config();

async function main() {
  console.log('\n📊 ZAMA FHEDEX - POOL STATE CHECKER');
  console.log('═══════════════════════════════════════════════════════\n');

  // Contract addresses from deployment
  const ZAMA_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const FHEDEX_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';

  try {
    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log('🌐 Network Info:');
    console.log(`   Name: ${network.name}`);
    console.log(`   Chain ID: ${network.chainId}`);
    console.log(`   Expected: 8008 (Zama FHEVM)\n`);

    // Get signer
    const [signer] = await ethers.getSigners();
    console.log('👤 Signer Address:', signer.address, '\n');

    // Load ABI files
    const fhedexABI = require('./artifacts/contracts/FHEDEX.sol/FHEDEX.json').abi;
    const tokenABI = require('./artifacts/contracts/ZamaToken.sol/ZamaToken.json').abi;

    // Connect to contracts
    const fhedex = new ethers.Contract(FHEDEX_ADDRESS, fhedexABI, signer);
    const token = new ethers.Contract(ZAMA_TOKEN_ADDRESS, tokenABI, signer);

    console.log('📋 Contract Addresses:');
    console.log(`   FHEDEX:     ${FHEDEX_ADDRESS}`);
    console.log(`   ZamaToken:  ${ZAMA_TOKEN_ADDRESS}\n`);

    // ════════════════════════════════════════════════════════════
    console.log('🔍 Checking Pool State...\n');

    // Get pool reserves
    console.log('📦 Getting Pool Reserves...');
    try {
      const reserves = await fhedex.getPoolReserves();
      console.log(`   ✅ Pool Reserves Retrieved:`);
      console.log(`      ETH Reserve:   ${ethers.utils.formatEther(reserves[0])} ETH`);
      console.log(`      Token Reserve: ${ethers.utils.formatUnits(reserves[1], 18)} ZAMA\n`);
    } catch (err) {
      console.log(`   ❌ Error getting reserves: ${err.message}\n`);
    }

    // Get total liquidity
    console.log('💧 Getting Total Liquidity...');
    try {
      const totalLiquidity = await fhedex.totalLiquidity();
      console.log(`   Total LP Tokens: ${ethers.utils.formatUnits(totalLiquidity, 18)} LP\n`);
    } catch (err) {
      console.log(`   ❌ Error getting liquidity: ${err.message}\n`);
    }

    // Get user liquidity
    console.log('👤 Checking User Liquidity...');
    try {
      const userLiquidity = await fhedex.userLiquidity(signer.address);
      console.log(`   User LP Balance: ${ethers.utils.formatUnits(userLiquidity, 18)} LP\n`);
    } catch (err) {
      console.log(`   ❌ Error getting user liquidity: ${err.message}\n`);
    }

    // ════════════════════════════════════════════════════════════
    console.log('🏦 Checking Contract Balances...\n');

    // ETH balance of FHEDEX
    const fhedexETHBalance = await ethers.provider.getBalance(FHEDEX_ADDRESS);
    console.log(`   FHEDEX ETH Balance: ${ethers.utils.formatEther(fhedexETHBalance)} ETH`);

    // Token balance of FHEDEX
    try {
      const fhedexTokenBalance = await token.balanceOf(FHEDEX_ADDRESS);
      console.log(`   FHEDEX Token Balance: ${ethers.utils.formatUnits(fhedexTokenBalance, 18)} ZAMA`);
    } catch (err) {
      console.log(`   ❌ Error getting token balance: ${err.message}`);
    }

    // ════════════════════════════════════════════════════════════
    console.log('\n📊 LIQUIDITY STATUS\n');

    if (fhedexETHBalance.isZero()) {
      console.log('   ⚠️  WARNING: No ETH in pool!');
      console.log('   Possible causes:');
      console.log('      1. initializePool() was never called');
      console.log('      2. Pool was initialized but on different contract');
      console.log('      3. Transaction reverted silently\n');
    } else {
      console.log('   ✅ ETH found in pool');
      console.log('   Pool is initialized!\n');
    }

    // ════════════════════════════════════════════════════════════
    console.log('🔗 Contract Verification Links:');
    console.log(`   FHEDEX:     https://testnet-explorer.zama.ai/address/${FHEDEX_ADDRESS}`);
    console.log(`   ZamaToken:  https://testnet-explorer.zama.ai/address/${ZAMA_TOKEN_ADDRESS}\n`);

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Possible issues:');
    console.log('   1. Network not accessible');
    console.log('   2. Wrong network selected');
    console.log('   3. Contracts not deployed\n');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
