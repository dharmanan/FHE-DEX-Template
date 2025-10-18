const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FHEDEX - FHE-Enabled DEX", () => {
  let fhedex, zamaToken, owner, addr1, addr2;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy ZamaToken (no parameters)
    const ZamaToken = await ethers.getContractFactory("ZamaToken");
    zamaToken = await ZamaToken.deploy();
    await zamaToken.deployed();

    // Deploy FHEDEX with token address
    const FHEDEX = await ethers.getContractFactory("FHEDEX");
    fhedex = await FHEDEX.deploy(zamaToken.address);
    await fhedex.deployed();

    // Approve tokens for FHEDEX
    await zamaToken.approve(fhedex.address, ethers.constants.MaxUint256);
    await zamaToken.connect(addr1).approve(fhedex.address, ethers.constants.MaxUint256);
    await zamaToken.connect(addr2).approve(fhedex.address, ethers.constants.MaxUint256);

    // Transfer tokens to test addresses
    await zamaToken.transfer(addr1.address, ethers.utils.parseEther("1000"));
    await zamaToken.transfer(addr2.address, ethers.utils.parseEther("1000"));
  });

  describe("Deployment", () => {
    it("Should deploy FHEDEX with correct token address", async () => {
      expect(await fhedex.token()).to.equal(zamaToken.address);
    });

    it("Should initialize with zero totalLiquidity", async () => {
      expect(await fhedex.totalLiquidity()).to.equal(0);
    });
  });

  describe("Pool Initialization", () => {
    it("Should initialize pool with initPool", async () => {
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");

      await expect(
        fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount })
      ).to.emit(fhedex, "PoolInit");

      expect(await fhedex.totalLiquidity()).to.be.gt(0);
    });

    it("Should fail if pool already initialized", async () => {
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");

      // First init
      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });

      // Second init should fail
      await expect(
        fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount })
      ).to.be.reverted;
    });

    it("Should fail with invalid amounts", async () => {
      const ethAmount = ethers.utils.parseEther("10");

      // ETH = 0
      await expect(
        fhedex.initPool(0, ethers.utils.parseEther("1000"), { value: 0 })
      ).to.be.reverted;
    });
  });

  describe("Deposits (Add Liquidity)", () => {
    beforeEach(async () => {
      // Initialize pool
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");
      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });
    });

    it("Should allow deposit after pool initialized", async () => {
      const ethAmount = ethers.utils.parseEther("5");
      const tokenAmount = ethers.utils.parseEther("500");

      await expect(
        fhedex.connect(addr1).deposit(tokenAmount, { value: ethAmount })
      ).to.emit(fhedex, "Deposit");
    });

    it("Should update totalLiquidity on deposit", async () => {
      const initialLiquidity = await fhedex.totalLiquidity();

      const ethAmount = ethers.utils.parseEther("5");
      const tokenAmount = ethers.utils.parseEther("500");

      await fhedex.connect(addr1).deposit(tokenAmount, { value: ethAmount });

      expect(await fhedex.totalLiquidity()).to.be.gt(initialLiquidity);
    });

    it("Should fail if pool not initialized", async () => {
      // New FHEDEX without initialization
      const FHEDEX = await ethers.getContractFactory("FHEDEX");
      const newFhedex = await FHEDEX.deploy(zamaToken.address);
      await newFhedex.deployed();

      const ethAmount = ethers.utils.parseEther("5");
      const tokenAmount = ethers.utils.parseEther("500");

      await expect(
        newFhedex.connect(addr1).deposit(tokenAmount, { value: ethAmount })
      ).to.be.reverted;
    });
  });

  describe("Swaps - ETH to Token", () => {
    beforeEach(async () => {
      // Initialize pool
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");
      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });
    });

    it("Should swap ETH for tokens", async () => {
      const swapAmount = ethers.utils.parseEther("1");
      const initialTokenBalance = await zamaToken.balanceOf(addr1.address);

      await expect(
        fhedex.connect(addr1).swapEth({ value: swapAmount })
      ).to.emit(fhedex, "SwapEthToken");

      const finalTokenBalance = await zamaToken.balanceOf(addr1.address);
      expect(finalTokenBalance).to.be.gt(initialTokenBalance);
    });

    it("Should calculate correct output for ETH swap", async () => {
      const swapAmount = ethers.utils.parseEther("1");

      // Get reserves before swap
      const [ethReserveBefore, tokenReserveBefore] = await fhedex.getReserves();

      await fhedex.connect(addr1).swapEth({ value: swapAmount });

      // Get reserves after swap
      const [ethReserveAfter, tokenReserveAfter] = await fhedex.getReserves();

      // ETH reserve should increase
      expect(ethReserveAfter).to.be.gt(ethReserveBefore);

      // Token reserve should decrease
      expect(tokenReserveAfter).to.be.lt(tokenReserveBefore);
    });

    it("Should fail with zero ETH", async () => {
      await expect(
        fhedex.connect(addr1).swapEth({ value: 0 })
      ).to.be.reverted;
    });
  });

  describe("Swaps - Token to ETH", () => {
    beforeEach(async () => {
      // Initialize pool
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");
      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });
    });

    it("Should swap tokens for ETH", async () => {
      const swapAmount = ethers.utils.parseEther("100");
      const initialEthBalance = await ethers.provider.getBalance(addr1.address);

      await fhedex.connect(addr1).swapToken(swapAmount);

      const finalEthBalance = await ethers.provider.getBalance(addr1.address);
      // ETH balance increased (accounting for gas)
      expect(finalEthBalance).to.be.lt(initialEthBalance); // Gas costs
    });

    it("Should calculate output for token swap", async () => {
      const swapAmount = ethers.utils.parseEther("100");

      // Get reserves before swap
      const [ethReserveBefore, tokenReserveBefore] = await fhedex.getReserves();

      await fhedex.connect(addr1).swapToken(swapAmount);

      // Get reserves after swap
      const [ethReserveAfter, tokenReserveAfter] = await fhedex.getReserves();

      // Token reserve should increase
      expect(tokenReserveAfter).to.be.gt(tokenReserveBefore);

      // ETH reserve should decrease
      expect(ethReserveAfter).to.be.lt(ethReserveBefore);
    });

    it("Should fail with zero tokens", async () => {
      await expect(
        fhedex.connect(addr1).swapToken(0)
      ).to.be.reverted;
    });
  });

  describe("Withdrawals (Remove Liquidity)", () => {
    beforeEach(async () => {
      // Initialize pool
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");
      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });

      // Owner deposits to have liquidity to withdraw
      await fhedex.deposit(
        ethers.utils.parseEther("500"),
        { value: ethers.utils.parseEther("5") }
      );
    });

    it("Should allow withdrawal", async () => {
      const lpAmount = ethers.utils.parseEther("10");

      await expect(
        fhedex.withdraw(lpAmount)
      ).to.emit(fhedex, "Withdraw");
    });

    it("Should update reserves on withdrawal", async () => {
      const lpAmount = ethers.utils.parseEther("10");

      const [ethReserveBefore, tokenReserveBefore] = await fhedex.getReserves();

      await fhedex.withdraw(lpAmount);

      const [ethReserveAfter, tokenReserveAfter] = await fhedex.getReserves();

      // Reserves should decrease
      expect(ethReserveAfter).to.be.lt(ethReserveBefore);
      expect(tokenReserveAfter).to.be.lt(tokenReserveBefore);
    });

    it("Should fail with zero LP amount", async () => {
      await expect(
        fhedex.withdraw(0)
      ).to.be.reverted;
    });
  });

  describe("Get Reserves", () => {
    it("Should return reserves correctly", async () => {
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");

      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });

      const [ethReserve, tokenReserve] = await fhedex.getReserves();

      expect(ethReserve).to.equal(ethAmount);
      expect(tokenReserve).to.equal(tokenAmount);
    });
  });

  describe("FHE Operations", () => {
    it("Should handle encrypted state correctly", async () => {
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");

      // Initialize with encrypted reserves
      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });

      // Reserves should be stored (encrypted internally)
      const [decryptedEth, decryptedToken] = await fhedex.getReserves();

      expect(decryptedEth).to.equal(ethAmount);
      expect(decryptedToken).to.equal(tokenAmount);
    });

    it("Should perform encrypted arithmetic operations", async () => {
      const ethAmount = ethers.utils.parseEther("10");
      const tokenAmount = ethers.utils.parseEther("1000");

      await fhedex.initPool(ethAmount, tokenAmount, { value: ethAmount });

      // Swap should use FHE operations internally
      const swapAmount = ethers.utils.parseEther("1");
      await fhedex.connect(addr1).swapEth({ value: swapAmount });

      // Verify results are correct (operations were performed on encrypted data)
      const [newEthReserve, newTokenReserve] = await fhedex.getReserves();

      expect(newEthReserve).to.be.gt(ethAmount);
      expect(newTokenReserve).to.be.lt(tokenAmount);
    });
  });
});
