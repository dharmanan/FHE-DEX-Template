require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true
    },
    zama_fhevm: {
      url: "https://testnet-rpc.zama.ai:8545",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8008,
      timeout: 60000
    },
    sepolia: {
      url: "https://eth-sepolia.public.blastapi.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
      timeout: 60000
    }
  },
  etherscan: {
    apiKey: {
      zama_fhevm: "0x0000000000000000000000000000000000000000"
    }
  }
};
