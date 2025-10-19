#!/bin/bash

# Remove old values
npx vercel env rm VITE_DEX_ADDRESS --yes 2>/dev/null || true
npx vercel env rm VITE_ZAMA_TOKEN_ADDRESS --yes 2>/dev/null || true

# Add new values (piping through stdin for CLI prompts)
echo "0x52e1F9F6F9d51F5640A221061d3ACf5FEa3398Be" | npx vercel env add VITE_DEX_ADDRESS production
echo "0x3630d67C78A3da51549e8608C17883Ea481D817F" | npx vercel env add VITE_ZAMA_TOKEN_ADDRESS production

echo "✓ Environment variables updated"
