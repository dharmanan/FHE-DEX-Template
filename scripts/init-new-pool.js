const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const FHEDEX_ADDR = '0xC06dFa845A5aAE13a666D48234d81176535AeBdD';
  const TOKEN_ADDR = '0x9fa47046C88F45A29c5b60d6B01aB68281128138';

  console.log('Deployer:', deployer.address);

  const tokenAbi = require('../artifacts/contracts/ZamaToken.sol/ZamaToken.json').abi;
  const dexAbi = require('../artifacts/contracts/FHEDEX.sol/FHEDEX.json').abi;

  const token = new hre.ethers.Contract(TOKEN_ADDR, tokenAbi, deployer);
  const dex = new hre.ethers.Contract(FHEDEX_ADDR, dexAbi, deployer);

  // Check balances
  const bal = await token.balanceOf(deployer.address);
  console.log('Token balance:', hre.ethers.utils.formatUnits(bal, 18));

  const ethBal = await deployer.getBalance();
  console.log('ETH balance:', hre.ethers.utils.formatEther(ethBal));

  const amount = hre.ethers.utils.parseUnits('100', 18);
  const ethAmount = hre.ethers.utils.parseEther('1');

  // Approve
  console.log('\nApproving...');
  const approveTx = await token.approve(FHEDEX_ADDR, amount);
  await approveTx.wait();
  console.log('✅ Approved');

  // Initialize with gas limit
  console.log('\nInitializing pool...');
  const initTx = await dex.initializePool(amount, { 
    value: ethAmount,
    gasLimit: 500000
  });
  await initTx.wait();
  console.log('✅ Pool initialized');

  // Check reserves
  const reserves = await dex.getPoolReserves();
  console.log('ETH Reserve:', hre.ethers.utils.formatEther(reserves[0]));
  console.log('Token Reserve:', hre.ethers.utils.formatUnits(reserves[1], 18));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
