const { expect } = require("chai");
const hre = require("hardhat");

describe("Zama FHEVM DEX - Compilation Check", function () {
  let fhedexFactory, zamaTokenFactory;

  before(async function () {
    // Get contract factories without network initialization
    fhedexFactory = await hre.ethers.getContractFactory("FHEDEX");
    zamaTokenFactory = await hre.ethers.getContractFactory("ZamaToken");
  });

  it("FHEDEX contract should compile successfully", async function () {
    expect(fhedexFactory).to.exist;
    expect(fhedexFactory.bytecode).to.be.a('string');
    expect(fhedexFactory.bytecode.length).to.be.greaterThan(0);
  });

  it("ZamaToken contract should compile successfully", async function () {
    expect(zamaTokenFactory).to.exist;
    expect(zamaTokenFactory.bytecode).to.be.a('string');
    expect(zamaTokenFactory.bytecode.length).to.be.greaterThan(0);
  });

  it("FHEDEX should have core liquidity management functions", async function () {
    const functions = Object.keys(fhedexFactory.interface.functions);
    expect(functions.some(f => f.includes('initializePool'))).to.be.true;
    expect(functions.some(f => f.includes('addLiquidity'))).to.be.true;
    expect(functions.some(f => f.includes('removeLiquidity'))).to.be.true;
    expect(functions.some(f => f.includes('swapEthForToken'))).to.be.true;
    expect(functions.some(f => f.includes('swapTokenForEth'))).to.be.true;
  });

  it("ZamaToken should be ERC20 compliant", async function () {
    const functions = Object.keys(zamaTokenFactory.interface.functions);
    expect(functions.some(f => f.includes('transfer'))).to.be.true;
    expect(functions.some(f => f.includes('balanceOf'))).to.be.true;
    expect(functions.some(f => f.includes('approve'))).to.be.true;
    expect(functions.some(f => f.includes('allowance'))).to.be.true;
  });

  it("FHEDEX should have correct encrypted state accessors", async function () {
    const functions = Object.keys(fhedexFactory.interface.functions);
    expect(functions.some(f => f.includes('getPoolReserves'))).to.be.true;
    expect(functions.some(f => f.includes('getLPBalance'))).to.be.true;
    expect(functions.some(f => f.includes('getTotalLiquidity'))).to.be.true;
  });
});
