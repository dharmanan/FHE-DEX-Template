const hre = require('hardhat');
const ethers = hre.ethers;

async function main() {
  console.log('\n📊 SEPOLIA - FHEDEX POOL STATE CHECKER\n');

  const DEX_ADDRESS = '0x1F1B2d3BDCe3674164eD34F1313a62486764CD19';
  const TOKEN_ADDRESS = '0x8CE14A95E9e9622F81b4C71eb99f1C2228bFD636';

  try {
    const provider = new ethers.providers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');
    const [signer] = await hre.ethers.getSigners();

    // Load ABIs
    const dexABI = require('./artifacts/contracts/FHEDEX.sol/FHEDEX.json').abi;
    const tokenABI = require('./artifacts/contracts/ZamaToken.sol/ZamaToken.json').abi;

    const dex = new ethers.Contract(DEX_ADDRESS, dexABI, provider);
    const token = new ethers.Contract(TOKEN_ADDRESS, tokenABI, provider);

    console.log('Contracts:', { DEX_ADDRESS, TOKEN_ADDRESS });
    
    // Get reserves
    const reserves = await dex.getPoolReserves();
    console.log('ETH Reserve:', ethers.utils.formatEther(reserves[0]), 'ETH');
    console.log('Token Reserve:', ethers.utils.formatUnits(reserves[1], 18), 'ZAMA');

    // Get ETH balance
    const ethBal = await provider.getBalance(DEX_ADDRESS);
    console.log('ETH Balance:', ethers.utils.formatEther(ethBal), 'ETH');

    // Get token balance
    const tokenBal = await token.balanceOf(DEX_ADDRESS);
    console.log('Token Balance:', ethers.utils.formatUnits(tokenBal, 18), 'ZAMA');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
