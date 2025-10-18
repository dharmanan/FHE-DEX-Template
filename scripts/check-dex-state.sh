#!/bin/bash

# DEX Contract State Checker
# Sepolia'da contract state'ini kontrol eder

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              DEX Contract State Checker (Sepolia)              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Hardhat config'den contract address'leri al
DEPLOYMENT_FILE="deployments/sepolia-deployment.json"

if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo "❌ Deployment file not found: $DEPLOYMENT_FILE"
    echo "Run 'npm run deploy:sepolia' first"
    exit 1
fi

ZAMA_TOKEN=$(jq -r '.zamaToken' "$DEPLOYMENT_FILE")
DEX=$(jq -r '.dex' "$DEPLOYMENT_FILE")
DEPLOYER=$(jq -r '.deployer' "$DEPLOYMENT_FILE")

echo "📋 Addresses:"
echo "  ZamaToken: $ZAMA_TOKEN"
echo "  DEX: $DEX"
echo "  Deployer: $DEPLOYER"
echo ""

echo "🔍 Checking DEX Contract State..."
echo ""

# npx hardhat console kullanarak state'i kontrol et
npx hardhat console --network sepolia <<'EOF'

const { ethers } = require("ethers");
const DEPLOYMENT_FILE = require('./deployments/sepolia-deployment.json');

const ZAMA_TOKEN_ADDRESS = DEPLOYMENT_FILE.zamaToken;
const DEX_ADDRESS = DEPLOYMENT_FILE.dex;
const DEPLOYER = DEPLOYMENT_FILE.deployer;

// ABI'lar
const ZAMA_TOKEN_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function totalSupply() view returns (uint)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)"
];

const DEX_ABI = [
  "function getReserves() view returns (uint ethReserve, uint tokenReserve)",
  "function totalLiquidity() view returns (uint)",
  "function liquidity(address) view returns (uint)"
];

// Contract instances
const tokenContract = new ethers.Contract(ZAMA_TOKEN_ADDRESS, ZAMA_TOKEN_ABI, ethers.provider);
const dexContract = new ethers.Contract(DEX_ADDRESS, DEX_ABI, ethers.provider);

async function checkState() {
  console.log("\n💰 Token Contract State:");
  console.log("  ├─ Total Supply:", ethers.utils.formatUnits(await tokenContract.totalSupply(), 18), "ZAMA");
  console.log("  ├─ DEX Balance:", ethers.utils.formatUnits(await tokenContract.balanceOf(DEX_ADDRESS), 18), "ZAMA");
  console.log("  └─ Deployer Balance:", ethers.utils.formatUnits(await tokenContract.balanceOf(DEPLOYER), 18), "ZAMA");

  console.log("\n📊 DEX Contract State:");
  const [ethReserve, tokenReserve] = await dexContract.getReserves();
  const totalLiq = await dexContract.totalLiquidity();
  
  console.log("  ├─ ETH Reserve:", ethers.utils.formatEther(ethReserve), "ETH");
  console.log("  ├─ Token Reserve:", ethers.utils.formatUnits(tokenReserve, 18), "ZAMA");
  console.log("  └─ Total Liquidity:", ethers.utils.formatUnits(totalLiq, 18), "LP");

  console.log("\n✅ State check complete");
  process.exit(0);
}

checkState().catch(err => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
EOF
