require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 5000
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  paths: {
    artifacts: './src/artifacts',
  }
};

// For work on Hardhat Network

// require("@nomicfoundation/hardhat-toolbox");

// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.9",
//   networks: {
//     hardhat: {
//       chainId: 31337,
//       mining: {
//         auto: true,
//         interval: 5000
//       }
//     },
//     localhost: {
//       url: "http://127.0.0.1:8545/",
//       chainId: 31337
//     }
//   },
//   paths: {
//     artifacts: './src/artifacts',
//   }
// };

