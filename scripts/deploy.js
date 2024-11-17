const { ethers } = require("hardhat");

async function main() {
  // Deploy test tokens for local testing
  console.log("Deploying test tokens for local Hardhat testing...");
  
  const Token = await ethers.getContractFactory("Token");
  const tk1 = await Token.deploy("Token One", "TK1");
  await tk1.deployed();
  console.log("Test TK1 deployed to:", tk1.address);
  
  const tk2 = await Token.deploy("Token Two", "TK2");
  await tk2.deployed();
  console.log("Test TK2 deployed to:", tk2.address);

  // Deploy the faucet
  console.log("\nDeploying faucet...");
  const SimpleFaucet = await ethers.getContractFactory("SimpleFaucet");
  const faucet = await SimpleFaucet.deploy(tk1.address, tk2.address);
  await faucet.deployed();
  console.log("Faucet deployed to:", faucet.address);

  // Fund the faucet with test tokens
  const fundAmount = ethers.utils.parseEther("1000");
  await tk1.transfer(faucet.address, fundAmount);
  await tk2.transfer(faucet.address, fundAmount);
  console.log("\nFaucet funded with 1000 of each test token");

  // For easy reference when testing
  console.log("\nDeployed contract addresses:");
  console.log("TK1:", tk1.address);
  console.log("TK2:", tk2.address);
  console.log("Faucet:", faucet.address);
  
  // Save the contract addresses for testing
  console.log("\nSave these addresses for your test files!");
  console.log(`
  Export these variables in your test files:
  const TK1_ADDRESS = "${tk1.address}";
  const TK2_ADDRESS = "${tk2.address}";
  const FAUCET_ADDRESS = "${faucet.address}";
  `);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  