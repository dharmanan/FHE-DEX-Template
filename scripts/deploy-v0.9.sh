#!/bin/bash
# 🚀 FHEVM v0.9 Deployment Script
# When @fhenixprotocol/contracts@0.9.0 is released, run this!

set -e

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 FHEVM v0.9 DEPLOYMENT SCRIPT 🚀                         ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Check current version
echo "📊 STEP 1: Check Current Version"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm ls @fhenixprotocol/contracts 2>&1 | grep "@fhenixprotocol/contracts"
echo ""

# Step 2: Update package
echo "📦 STEP 2: Update @fhenixprotocol/contracts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running: npm install @fhenixprotocol/contracts@latest"
npm install @fhenixprotocol/contracts@latest
echo "✅ Updated!"
echo ""

# Step 3: Verify version
echo "✅ STEP 3: Verify New Version"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm ls @fhenixprotocol/contracts 2>&1 | grep "@fhenixprotocol/contracts"
echo ""

# Step 4: Compile contracts
echo "🔨 STEP 4: Compile Contracts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npx hardhat compile
echo "✅ Compiled!"
echo ""

# Step 5: Deploy to Sepolia
echo "🌐 STEP 5: Deploy FHEDEX to Sepolia"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running: npx hardhat run scripts/deploy-fhedex-real.js --network sepolia"
npx hardhat run scripts/deploy-fhedex-real.js --network sepolia
echo ""

# Step 6: Initialize liquidity
echo "💧 STEP 6: Initialize Liquidity Pool"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Running: npx hardhat run scripts/init-liquidity.js --network sepolia"
npx hardhat run scripts/init-liquidity.js --network sepolia
echo ""

# Step 7: Build frontend
echo "🎨 STEP 7: Build Frontend"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
npm run build
echo "✅ Built!"
echo ""

# Step 8: Git commit
echo "📝 STEP 8: Git Commit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
git add -A
git commit -m "feat: upgrade to FHEVM v0.9 with Sepolia FHE support - real liquidity initialized!"
git push
echo "✅ Pushed!"
echo ""

# Step 9: Deploy to Vercel
echo "🚀 STEP 9: Deploy to Vercel"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Run: vercel deploy --prod"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════════╗"
echo "║                     ✨ DEPLOYMENT COMPLETE! ✨                                ║"
echo "╚════════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 ZAMA DEX is now running with REAL FHE on Sepolia!"
echo ""
echo "Next steps:"
echo "  1. Deploy to Vercel: vercel deploy --prod"
echo "  2. Test on live URL"
echo "  3. Submit to Builder Track"
echo ""
echo "🏆 Builder Track: READY WITH REAL FHE! 🏆"
