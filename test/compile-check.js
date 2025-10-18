const { expect } = require("chai");

describe("Contract Compilation Check", function () {
  it("FHEDEX contract should compile successfully", async function () {
    const FHEDEX = await ethers.getContractFactory("FHEDEX");
    expect(FHEDEX).to.exist;
    expect(FHEDEX.bytecode).to.be.a('string');
    expect(FHEDEX.bytecode.length).to.be.greaterThan(0);
  });

  it("ZamaToken contract should compile successfully", async function () {
    const ZamaToken = await ethers.getContractFactory("ZamaToken");
    expect(ZamaToken).to.exist;
    expect(ZamaToken.bytecode).to.be.a('string');
    expect(ZamaToken.bytecode.length).to.be.greaterThan(0);
  });

  it("FHEDEX should have required functions", async function () {
    const FHEDEX = await ethers.getContractFactory("FHEDEX");
    const functions = Object.keys(FHEDEX.interface.functions);
    expect(functions.some(f => f.includes('initPool'))).to.be.true;
    expect(functions.some(f => f.includes('deposit'))).to.be.true;
    expect(functions.some(f => f.includes('swapEth'))).to.be.true;
    expect(functions.some(f => f.includes('swapToken'))).to.be.true;
    expect(functions.some(f => f.includes('withdraw'))).to.be.true;
    expect(functions.some(f => f.includes('getReserves'))).to.be.true;
  });

  it("ZamaToken should be ERC20 compliant", async function () {
    const ZamaToken = await ethers.getContractFactory("ZamaToken");
    const functions = Object.keys(ZamaToken.interface.functions);
    expect(functions.some(f => f.includes('transfer'))).to.be.true;
    expect(functions.some(f => f.includes('balanceOf'))).to.be.true;
    expect(functions.some(f => f.includes('approve'))).to.be.true;
    expect(functions.some(f => f.includes('allowance'))).to.be.true;
  });
});
