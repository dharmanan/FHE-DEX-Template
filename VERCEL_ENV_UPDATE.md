# Vercel Environment Variables - Update Instructions

## Step 1: Go to Vercel Dashboard
https://vercel.com/dashboard

## Step 2: Select Project
Click on: **kohens-projects/zama-dex-fhe**

## Step 3: Go to Settings
Settings → Environment Variables

## Step 4: Remove Old Variables (if exist)
- Remove: `VITE_DEX_ADDRESS` (old value)
- Remove: `VITE_ZAMA_TOKEN_ADDRESS` (old value)

## Step 5: Add New Variables

### Variable 1:
- **Name:** `VITE_DEX_ADDRESS`
- **Value:** `0x52e1F9F6F9d51F5640A221061d3ACf5FEa3398Be`
- **Environments:** Check "Production", "Preview", "Development"
- Click: "Save"

### Variable 2:
- **Name:** `VITE_ZAMA_TOKEN_ADDRESS`
- **Value:** `0x3630d67C78A3da51549e8608C17883Ea481D817F`
- **Environments:** Check "Production", "Preview", "Development"
- Click: "Save"

## Step 6: Redeploy
1. Go to: Deployments tab
2. Find latest commit (should be "Update production env with new contract addresses")
3. Click 3 dots (⋮) → "Redeploy"
4. Confirm

## Verification
After redeploy (2-3 min), test at:
https://zama-dex-qlvj35od7-kohens-projects.vercel.app

---

## Contract Details
| Item | Old | New |
|------|-----|-----|
| DEX Contract | 0xc7a8884fa733510A3A1C7021e38Dd053dDb75e41 | **0x52e1F9F6F9d51F5640A221061d3ACf5FEa3398Be** |
| ZAMA Token | 0x2080Db70a9490Eb7E3d7C5ebD58C36F58CE908A1 | **0x3630d67C78A3da51549e8608C17883Ea481D817F** |
| Network | Sepolia (11155111) | Sepolia (11155111) |
| Status | Broken (no TOKEN on withdraw) | ✅ FIXED |

---

## If Still Shows Old Contract
1. Clear browser cache: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
2. Clear: Cookies and Cached Images for `vercel.app`
3. Refresh: F5
4. Hard refresh: Ctrl+F5 (or Cmd+Shift+R on Mac)
