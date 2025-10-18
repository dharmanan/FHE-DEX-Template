

require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20"  // For Fhenix contracts
      },
      {
        version: "0.8.24"  // For Zama FHEVM contracts
      }
    ]
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY]
    },
    fhenix_testnet: {
      url: "https://api.testnet.fhenix.io:7747",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8007
    },
    zama_fhevm: {
      url: "https://testnet-rpc.zama.ai:8545",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 8008
    }
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "YourEtherscanAPIKeyHere",
      fhenix_testnet: "0x0000000000000000000000000000000000000000",
      zama_fhevm: "0x0000000000000000000000000000000000000000"
    }
  }
};
