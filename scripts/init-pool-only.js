/**
 * Initialize Pool ONLY (for existing contracts)
 * Use this when contracts already exist, just need pool initialization
 */

const hre = require('hardhat');
const fs = require('fs');
require('dotenv').config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('\n📝 Initializing Pool for Existing Contracts...');
  console.log('Deployer:', deployer.address);

  // Existing contract addresses from last deployment
  const ZAMA_TOKEN_ADDRESS = '0x8B5713e21d09aB4E535dE5dCCCd1C21f8d179230';
  const FHEDEX_ADDRESS = '0x46513f306Fef0Ccc48485497e16113CA7A1a6BcF';

  console.log('ZamaToken:', ZAMA_TOKEN_ADDRESS);
  console.log('FHEDEX:', FHEDEX_ADDRESS);

  // Connect to existing contracts
  const zamaToken = await ethers.getContractAt('ZamaToken', ZAMA_TOKEN_ADDRESS);
  const fhedex = await ethers.getContractAt('FHEDEX', FHEDEX_ADDRESS);

  // Pool parameters (reduced to save gas)
  const initialTokenAmount = ethers.utils.parseUnits('100', 18);
  const initialEthAmount = ethers.utils.parseEther('1');

  console.log('\n💧 Initializing Pool...');
  console.log('   ETH: 10');
  console.log('   Token: 1000 ZAMA');

  // Approve
  console.log('\n   1️⃣ Approving tokens...');
  const approveTx = await zamaToken.approve(FHEDEX_ADDRESS, initialTokenAmount);
  await approveTx.wait();
  console.log('      ✅ Approved');

  // Initialize
  console.log('   2️⃣ Initializing pool...');
  const initTx = await fhedex.initializePool(initialTokenAmount, {
    value: initialEthAmount,
    gasLimit: 5000000,
  });
  const receipt = await initTx.wait();
  console.log('      ✅ Pool initialized');
  console.log('      TX:', initTx.hash);

  // Verify
  const reserves = await fhedex.getPoolReserves();
  console.log('\n✅ Pool Ready:');
  console.log('   ETH Reserve:', ethers.utils.formatEther(reserves[0]));
  console.log('   Token Reserve:', ethers.utils.formatUnits(reserves[1], 18));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
