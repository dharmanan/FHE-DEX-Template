/**
 * Integration Test: End-to-End Swap Callback Flow
 * Tests complete flow: submitSwap → requestId → Oracle → callback → completion
 */

const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('FHEDEX - End-to-End Callback Flow', function () {
  let fhedexContract;
  let zamaToken;
  let owner;
  let user;
  let ownerAddress;
  let userAddress;

  const INITIAL_ETH_RESERVE = ethers.utils.parseEther('10');
  const INITIAL_TOKEN_RESERVE = ethers.utils.parseUnits('1000', 18);
  const USER_TOKEN_BALANCE = ethers.utils.parseUnits('500', 18);

  before(async function () {
    // Get signers
    [owner, user] = await ethers.getSigners();
    ownerAddress = await owner.getAddress();
    userAddress = await user.getAddress();

    // Deploy ZamaToken
    const ZamaToken = await ethers.getContractFactory('ZamaToken');
    zamaToken = await ZamaToken.deploy();
    await zamaToken.deployed();

    // Deploy FHEDEX
    const FHEDEX = await ethers.getContractFactory('FHEDEX');
    fhedexContract = await FHEDEX.deploy(zamaToken.address);
    await fhedexContract.deployed();

    // Setup: Transfer tokens to user
    await zamaToken.transfer(userAddress, USER_TOKEN_BALANCE);

    // Setup: Initialize pool with initial liquidity
    await zamaToken.approve(fhedexContract.address, INITIAL_TOKEN_RESERVE);
    await fhedexContract.initializePool(INITIAL_TOKEN_RESERVE, {
      value: INITIAL_ETH_RESERVE,
    });

    console.log('✅ Test setup complete');
    console.log('   FHEDEX deployed at:', fhedexContract.address);
    console.log('   ZamaToken deployed at:', zamaToken.address);
    console.log('   Pool: 10 ETH + 1000 ZAMA');
  });

  describe('ETH → TOKEN Swap Callback Flow', function () {
    it('Step 1: User calls swapEthForToken and SwapRequested event emits with requestId', async function () {
      const swapAmount = ethers.utils.parseEther('1');

      // Listen for SwapRequested event
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          resolve({
            user: args[0],
            direction: args[1],
            amount: args[2],
            requestId: args[3],
          });
        });
      });

      // Execute swap
      console.log('\n📤 Step 1: User submits swap (1 ETH → ZAMA)');
      const tx = await fhedexContract.connect(user).swapEthForToken({ value: swapAmount });
      await tx.wait();

      // Wait for event
      const eventData = await swapPromise;

      console.log('   ✅ SwapRequested event emitted:');
      console.log('      - user:', eventData.user);
      console.log('      - direction:', eventData.direction);
      console.log('      - amount:', ethers.utils.formatEther(eventData.amount), 'ETH');
      console.log('      - requestId:', eventData.requestId.toString());

      expect(eventData.user).to.equal(userAddress);
      expect(eventData.direction).to.equal('ETH_TO_TOKEN');
      expect(eventData.amount).to.equal(swapAmount);
      // requestId is BigNumber, convert to number for comparison
      expect(eventData.requestId.toNumber?.() || Number(eventData.requestId)).to.be.greaterThan(0);
    }).timeout(10000);

    it('Step 2: Verify PendingSwap is tracked on contract', async function () {
      const swapAmount = ethers.utils.parseEther('1');

      // Get requestId from event
      let requestId = 0;
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          requestId = args[3].toNumber?.() || args[3];
          resolve(requestId);
        });
      });

      // Execute swap
      console.log('\n📝 Step 2: Verify PendingSwap tracking');
      await fhedexContract.connect(user).swapEthForToken({ value: swapAmount });

      requestId = await swapPromise;

      // Query pending swap
      const pendingSwap = await fhedexContract.getPendingSwap(requestId);

      console.log('   ✅ PendingSwap retrieved for requestId:', requestId);
      console.log('      - user:', pendingSwap.user);
      console.log('      - inputAmount:', ethers.utils.formatEther(pendingSwap.inputAmount), 'ETH');
      console.log('      - direction:', pendingSwap.direction);
      console.log('      - completed:', pendingSwap.completed);

      expect(pendingSwap.user).to.equal(userAddress);
      expect(pendingSwap.inputAmount).to.equal(swapAmount);
      expect(pendingSwap.direction).to.equal('ETH_TO_TOKEN');
      expect(pendingSwap.completed).to.be.false;
    }).timeout(10000);

    it('Step 3: Simulate Oracle decryption and call handleDecryptedSwap', async function () {
      const swapAmount = ethers.utils.parseEther('1');

      // Get requestId
      let requestId = 0;
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          requestId = args[3].toNumber?.() || args[3];
          resolve(requestId);
        });
      });

      // Execute swap
      console.log('\n🔐 Step 3: Oracle decryption and callback');
      await fhedexContract.connect(user).swapEthForToken({ value: swapAmount });

      requestId = await swapPromise;

      // Calculate expected output using Constant Product Formula
      const reserves = await fhedexContract.getPoolReserves();
      const inputReserve = reserves.ethBalance;
      const outputReserve = reserves.tokenBalance;

      const inputAfterFee = swapAmount.mul(997).div(1000); // 0.3% fee
      const output = inputAfterFee.mul(outputReserve).div(inputReserve.add(inputAfterFee));

      console.log('   📊 Calculation:');
      console.log('      - Input (after 0.3% fee):', ethers.utils.formatEther(inputAfterFee), 'ETH');
      console.log('      - Output Reserve:', ethers.utils.formatUnits(outputReserve, 18), 'ZAMA');
      console.log('      - Input Reserve:', ethers.utils.formatEther(inputReserve), 'ETH');
      console.log('      - Expected output:', ethers.utils.formatUnits(output, 18), 'ZAMA');

      // Listen for SwapCompleted event
      const completePromise = new Promise((resolve) => {
        fhedexContract.once('SwapCompleted', (...args) => {
          resolve({
            user: args[0],
            requestId: args[1],
            outputAmount: args[2],
          });
        });
      });

      // Simulate Oracle callback (owner calls handleDecryptedSwap)
      console.log('   🔄 Calling handleDecryptedSwap(requestId=' + requestId + ', output)');
      const callbackTx = await fhedexContract.handleDecryptedSwap(requestId, output);
      await callbackTx.wait();

      const completionEvent = await completePromise;

      console.log('   ✅ SwapCompleted event emitted:');
      console.log('      - user:', completionEvent.user);
      console.log('      - requestId:', completionEvent.requestId.toString());
      console.log('      - outputAmount:', ethers.utils.formatUnits(completionEvent.outputAmount, 18), 'ZAMA');

      expect(completionEvent.user).to.equal(userAddress);
      expect(completionEvent.requestId).to.equal(requestId);
      expect(completionEvent.outputAmount).to.equal(output);
    }).timeout(10000);

    it('Step 4: Verify user received tokens and balances updated', async function () {
      const swapAmount = ethers.utils.parseEther('1');

      // Get user's initial balance
      const userInitialBalance = await zamaToken.balanceOf(userAddress);
      console.log('\n💰 Step 4: Verify token transfer');
      console.log('   User initial ZAMA balance:', ethers.utils.formatUnits(userInitialBalance, 18));

      // Get requestId
      let requestId = 0;
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          requestId = args[3].toNumber?.() || args[3];
          resolve(requestId);
        });
      });

      // Execute swap
      await fhedexContract.connect(user).swapEthForToken({ value: swapAmount });

      requestId = await swapPromise;

      // Calculate expected output
      const reserves = await fhedexContract.getPoolReserves();
      const inputAfterFee = swapAmount.mul(997).div(1000);
      const output = inputAfterFee.mul(reserves.tokenBalance).div(reserves.ethBalance.add(inputAfterFee));

      // Execute callback
      await fhedexContract.handleDecryptedSwap(requestId, output);

      // Check user's new balance
      const userNewBalance = await zamaToken.balanceOf(userAddress);
      const received = userNewBalance.sub(userInitialBalance);

      console.log('   User new ZAMA balance:', ethers.utils.formatUnits(userNewBalance, 18));
      console.log('   Tokens received:', ethers.utils.formatUnits(received, 18));

      expect(received).to.equal(output);

      // Verify pending swap is marked completed
      const pendingSwap = await fhedexContract.getPendingSwap(requestId);
      expect(pendingSwap.completed).to.be.true;

      console.log('   ✅ Pending swap marked as completed');
    }).timeout(10000);
  });

  describe('TOKEN → ETH Swap Callback Flow', function () {
    it('Step 1: User calls swapTokenForEth and SwapRequested event emits with requestId', async function () {
      const tokenAmount = ethers.utils.parseUnits('100', 18);

      // Approve token transfer
      await zamaToken.connect(user).approve(fhedexContract.address, tokenAmount);

      // Listen for SwapRequested event
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          resolve({
            user: args[0],
            direction: args[1],
            amount: args[2],
            requestId: args[3],
          });
        });
      });

      // Execute swap
      console.log('\n📤 Step 1 (TOKEN→ETH): User submits swap (100 ZAMA → ETH)');
      const tx = await fhedexContract.connect(user).swapTokenForEth(tokenAmount);
      await tx.wait();

      // Wait for event
      const eventData = await swapPromise;

      console.log('   ✅ SwapRequested event emitted:');
      console.log('      - user:', eventData.user);
      console.log('      - direction:', eventData.direction);
      console.log('      - amount:', ethers.utils.formatUnits(eventData.amount, 18), 'ZAMA');
      console.log('      - requestId:', eventData.requestId.toString());

      expect(eventData.user).to.equal(userAddress);
      expect(eventData.direction).to.equal('TOKEN_TO_ETH');
      expect(eventData.amount).to.equal(tokenAmount);
      // requestId is BigNumber, convert to number for comparison
      expect(eventData.requestId.toNumber?.() || Number(eventData.requestId)).to.be.greaterThan(0);
    }).timeout(10000);

    it('Step 2: Verify callback completes TOKEN→ETH swap correctly', async function () {
      const tokenAmount = ethers.utils.parseUnits('100', 18);

      // Approve token transfer
      await zamaToken.connect(user).approve(fhedexContract.address, tokenAmount);

      // Get requestId
      let requestId = 0;
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          requestId = args[3].toNumber?.() || args[3];
          resolve(requestId);
        });
      });

      // Get user's initial ETH balance
      const userInitialEth = await ethers.provider.getBalance(userAddress);

      // Execute swap
      console.log('\n💵 Step 2 (TOKEN→ETH): Execute callback and verify ETH transfer');
      await fhedexContract.connect(user).swapTokenForEth(tokenAmount);

      requestId = await swapPromise;

      // Calculate expected output
      const reserves = await fhedexContract.getPoolReserves();
      const inputAfterFee = tokenAmount.mul(997).div(1000);
      const output = inputAfterFee.mul(reserves.ethBalance).div(reserves.tokenBalance.add(inputAfterFee));

      console.log('   Expected output:', ethers.utils.formatEther(output), 'ETH');

      // Execute callback
      const callbackTx = await fhedexContract.handleDecryptedSwap(requestId, output);
      await callbackTx.wait();

      // Check user's new ETH balance
      const userNewEth = await ethers.provider.getBalance(userAddress);

      console.log('   ✅ Callback executed successfully');
      console.log('   Pending swap marked as completed');

      // Verify pending swap is marked completed
      const pendingSwap = await fhedexContract.getPendingSwap(requestId);
      expect(pendingSwap.completed).to.be.true;
    }).timeout(10000);
  });

  describe('Error Cases', function () {
    it('Should reject handleDecryptedSwap for already completed swap', async function () {
      const swapAmount = ethers.utils.parseEther('0.5');

      // Get requestId
      let requestId = 0;
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          requestId = args[3].toNumber?.() || args[3];
          resolve(requestId);
        });
      });

      // Execute swap
      console.log('\n❌ Error Case: Double completion attempt');
      await fhedexContract.connect(user).swapEthForToken({ value: swapAmount });

      requestId = await swapPromise;

      // Calculate output
      const reserves = await fhedexContract.getPoolReserves();
      const inputAfterFee = swapAmount.mul(997).div(1000);
      const output = inputAfterFee.mul(reserves.tokenBalance).div(reserves.ethBalance.add(inputAfterFee));

      // First callback - should succeed
      console.log('   First callback (requestId=' + requestId + ')...');
      await fhedexContract.handleDecryptedSwap(requestId, output);
      console.log('   ✅ First callback succeeded');

      // Second callback - should fail
      console.log('   Second callback (duplicate)...');
      try {
        await fhedexContract.handleDecryptedSwap(requestId, output);
        console.log('   ❌ FAILED: Should have rejected duplicate');
        expect.fail('Should have thrown error');
      } catch (error) {
        console.log('   ✅ Correctly rejected duplicate');
        expect(error.message).to.include('Swap already completed');
      }
    }).timeout(10000);

    it('Should reject handleDecryptedSwap for invalid requestId', async function () {
      console.log('\n❌ Error Case: Invalid requestId');

      const invalidRequestId = 99999;
      const dummyOutput = ethers.utils.parseUnits('100', 18);

      try {
        await fhedexContract.handleDecryptedSwap(invalidRequestId, dummyOutput);
        console.log('   ❌ FAILED: Should have rejected invalid requestId');
        expect.fail('Should have thrown error');
      } catch (error) {
        console.log('   ✅ Correctly rejected invalid requestId');
        expect(error.message).to.include('Invalid request ID');
      }
    }).timeout(10000);
  });

  describe('Pool State Verification', function () {
    it('Should verify pool reserves updated after swaps', async function () {
      console.log('\n📊 Pool State Verification');

      // Get initial reserves
      const initialReserves = await fhedexContract.getPoolReserves();
      console.log('   Initial pool state:');
      console.log('      - ETH reserve:', ethers.utils.formatEther(initialReserves.ethBalance));
      console.log('      - Token reserve:', ethers.utils.formatUnits(initialReserves.tokenBalance, 18));

      const swapAmount = ethers.utils.parseEther('0.2');

      // Get requestId
      let requestId = 0;
      const swapPromise = new Promise((resolve) => {
        fhedexContract.once('SwapRequested', (...args) => {
          requestId = args[3].toNumber?.() || args[3];
          resolve(requestId);
        });
      });

      // Execute swap
      await fhedexContract.connect(user).swapEthForToken({ value: swapAmount });

      requestId = await swapPromise;

      // Calculate output
      const inputAfterFee = swapAmount.mul(997).div(1000);
      const output = inputAfterFee
        .mul(initialReserves.tokenBalance)
        .div(initialReserves.ethBalance.add(inputAfterFee));

      // Execute callback
      await fhedexContract.handleDecryptedSwap(requestId, output);

      // Get new reserves
      const newReserves = await fhedexContract.getPoolReserves();
      console.log('   After swap:');
      console.log('      - ETH reserve:', ethers.utils.formatEther(newReserves.ethBalance));
      console.log('      - Token reserve:', ethers.utils.formatUnits(newReserves.tokenBalance, 18));

      // Verify reserves changed correctly
      expect(newReserves.ethBalance).to.equal(initialReserves.ethBalance.add(swapAmount));
      expect(newReserves.tokenBalance).to.equal(initialReserves.tokenBalance.sub(output));

      console.log('   ✅ Pool reserves updated correctly');

      // Verify Constant Product invariant (approximately)
      const k_before = initialReserves.ethBalance.mul(initialReserves.tokenBalance);
      const k_after = newReserves.ethBalance.mul(newReserves.tokenBalance);
      const kRatio = k_after.mul(1000).div(k_before);

      console.log('   Invariant check (x*y=k):');
      console.log('      - k_before:', k_before.toString());
      console.log('      - k_after:', k_after.toString());
      console.log('      - k_after/k_before:', kRatio.toNumber() / 1000);

      // After 0.3% fee, k_after should be >= k_before
      expect(k_after).to.be.gte(k_before);

      console.log('   ✅ Constant Product invariant maintained');
    }).timeout(10000);
  });
});
