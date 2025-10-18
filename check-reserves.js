const ethers = require('ethers');
const DEX_ABI = require('./abis/DEX.json');
const TOKEN_ABI = require('./abis/ZamaToken.json');

const DEX_ADDRESS = '0x50B85A4A3c76be5B36c1CfA04B1AFc44dd1EBE7c';
const TOKEN_ADDRESS = '0xb2B26a1222D5c02a081cBDC06277D71BD50927e6';

async function checkReserves() {
  const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/' + process.env.INFURA_PROJECT_ID);
  
  const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, provider);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
  
  const [ethReserve, tokenReserve] = await dexContract.getReserves();
  const totalLiq = await dexContract.totalLiquidity();
  
  console.log('📊 DEX State:');
  console.log('ETH Reserve:', ethers.utils.formatEther(ethReserve), 'ETH');
  console.log('Token Reserve:', ethers.utils.formatUnits(tokenReserve, 18), 'ZAMA');
  console.log('Total Liquidity:', ethers.utils.formatEther(totalLiq), 'LP');
  
  // Check DEX token balance directly
  const dexTokenBal = await tokenContract.balanceOf(DEX_ADDRESS);
  console.log('\nDirect Token Balance:', ethers.utils.formatUnits(dexTokenBal, 18), 'ZAMA');
  
  // Check DEX ETH balance
  const dexEthBal = await provider.getBalance(DEX_ADDRESS);
  console.log('Direct ETH Balance:', ethers.utils.formatEther(dexEthBal), 'ETH');
}

checkReserves().catch(console.error);
