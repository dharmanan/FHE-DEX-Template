const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DEX", () => {
  let dex, zamaToken, owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    // ZamaToken deploy
    const ZamaToken = await ethers.getContractFactory("ZamaToken");
    zamaToken = await ZamaToken.deploy(owner.address);
    await zamaToken.deployed();

    // DEX deploy
    const DEX = await ethers.getContractFactory("DEX");
    dex = await DEX.deploy(zamaToken.address);
    await dex.deployed();

    // Token'ı DEX'e transfer için approve et
    await zamaToken.approve(dex.address, ethers.constants.MaxUint256);
  });

  describe("Deployment", () => {
    it("Should deploy with correct token address", async () => {
      expect(await dex.token()).to.equal(zamaToken.address);
    });

    it("Should initialize with zero liquidity", async () => {
      expect(await dex.totalLiquidity()).to.equal(0);
    });
  });

  describe("Liquidity", () => {
    it("Should allow initial liquidity provision", async () => {
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("100");

      await expect(
        dex.deposit(tokenAmount, { value: ethAmount })
      ).to.emit(dex, "Deposit");

      expect(await dex.totalLiquidity()).to.be.gt(0);
      expect(await dex.liquidity(owner.address)).to.equal(ethAmount);
    });

    it("Should allow adding more liquidity", async () => {
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("100");

      // Initial deposit
      await dex.deposit(tokenAmount, { value: ethAmount });

      // Second deposit
      await expect(
        dex.deposit(tokenAmount, { value: ethAmount })
      ).to.not.be.reverted;

      expect(await dex.liquidity(owner.address)).to.be.gt(ethAmount);
    });

    it("Should reject invalid liquidity amounts", async () => {
      await expect(dex.deposit(0, { value: 0 })).to.be.revertedWith(
        "ETH amount must be > 0"
      );
    });
  });

  describe("Swaps", () => {
    beforeEach(async () => {
      // Setup liquidity pool
      const ethAmount = ethers.utils.parseEther("100");
      const tokenAmount = ethers.utils.parseEther("1000");
      await dex.deposit(tokenAmount, { value: ethAmount });
    });

    it("Should perform ETH to Token swap", async () => {
      const ethInput = ethers.utils.parseEther("1");
      const initialTokenBalance = await zamaToken.balanceOf(owner.address);

      await dex.ethToTokenSwap({ value: ethInput });

      const finalTokenBalance = await zamaToken.balanceOf(owner.address);
      expect(finalTokenBalance).to.be.gt(initialTokenBalance);
    });

    it("Should perform Token to ETH swap", async () => {
      const tokenInput = ethers.utils.parseEther("10");
      const initialTokenBalance = await zamaToken.balanceOf(owner.address);

      await dex.tokenToEthSwap(tokenInput);

      const finalTokenBalance = await zamaToken.balanceOf(owner.address);
      expect(finalTokenBalance).to.be.lt(initialTokenBalance);
      expect(initialTokenBalance.sub(finalTokenBalance)).to.equal(tokenInput);
    });

    it("Should reject zero amount swap", async () => {
      await expect(dex.tokenToEthSwap(0)).to.be.revertedWith(
        "Input must be > 0"
      );
    });
  });

  describe("Withdrawal", () => {
    beforeEach(async () => {
      // Setup liquidity
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("100");
      await dex.deposit(tokenAmount, { value: ethAmount });
    });

    it("Should allow liquidity withdrawal", async () => {
      const lpAmount = ethers.utils.parseEther("5");
      const initialEthBalance = await ethers.provider.getBalance(owner.address);

      const tx = await dex.withdraw(lpAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalEthBalance = await ethers.provider.getBalance(owner.address);
      expect(finalEthBalance).to.be.gt(initialEthBalance.sub(gasUsed));
    });

    it("Should reject withdrawal with insufficient liquidity", async () => {
      const lpAmount = ethers.utils.parseEther("100");
      await expect(dex.withdraw(lpAmount)).to.be.revertedWith(
        "Insufficient liquidity"
      );
    });
  });

  describe("Reserves", () => {
    it("Should return correct reserves", async () => {
      const ethAmount = ethers.utils.parseEther("50");
      const tokenAmount = ethers.utils.parseEther("500");

      await dex.deposit(tokenAmount, { value: ethAmount });

      const [ethReserve, tokenReserve] = await dex.getReserves();
      expect(ethReserve).to.equal(ethAmount);
      expect(tokenReserve).to.equal(tokenAmount);
    });
  });
});
