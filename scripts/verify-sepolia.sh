#!/bin/bash

# Sepolia Etherscan Verification Script
# Hardhat'in verify plugin'ini kullanarak contract'ları Etherscan'da verify eder

echo "=== Sepolia Etherscan Contract Verification ==="
echo ""

# Deployment info'yu oku
DEPLOYMENT_FILE="deployments/sepolia-deployment.json"

if [ ! -f "$DEPLOYMENT_FILE" ]; then
    echo "❌ Deployment file not found: $DEPLOYMENT_FILE"
    echo "Run 'npm run deploy:sepolia' first"
    exit 1
fi

ZAMA_TOKEN=$(jq -r '.zamaToken' "$DEPLOYMENT_FILE")
DEX=$(jq -r '.dex' "$DEPLOYMENT_FILE")
DEPLOYER=$(jq -r '.deployer' "$DEPLOYMENT_FILE")

echo "Deployment Addresses:"
echo "  ZamaToken: $ZAMA_TOKEN"
echo "  DEX: $DEX"
echo "  Deployer: $DEPLOYER"
echo ""

# Verify ZamaToken
echo "1. Verifying ZamaToken..."
npx hardhat verify --network sepolia "$ZAMA_TOKEN" "$DEPLOYER" 2>&1 | tail -5
echo ""

# Verify DEX
echo "2. Verifying DEX..."
npx hardhat verify --network sepolia "$DEX" "$ZAMA_TOKEN" 2>&1 | tail -5
echo ""

echo "✓ Verification complete!"
echo ""
echo "Check status at:"
echo "  ZamaToken: https://sepolia.etherscan.io/address/$ZAMA_TOKEN"
echo "  DEX: https://sepolia.etherscan.io/address/$DEX"
