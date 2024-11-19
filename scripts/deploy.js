const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy tokens
  const Token = await ethers.getContractFactory("Token");
  
  console.log("Deploying TK1...");
  const tk1 = await Token.deploy("Token One", "TK1");
  await tk1.deployed();
  console.log("TK1 deployed to:", tk1.address);
  
  console.log("Deploying TK2...");
  const tk2 = await Token.deploy("Token Two", "TK2");
  await tk2.deployed();
  console.log("TK2 deployed to:", tk2.address);

  // Deploy faucet
  console.log("Deploying faucet...");
  const Faucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(tk1.address, tk2.address);
  await faucet.deployed();
  console.log("Faucet deployed to:", faucet.address);

  // Save addresses
  const addresses = {
    TK1_ADDRESS: tk1.address,
    TK2_ADDRESS: tk2.address,
    FAUCET_ADDRESS: faucet.address
  };

  // Ensure directories exist
  const dirs = ['./public', './src'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });

  // Save addresses to both locations for frontend access
  fs.writeFileSync(
    "./public/deployedAddresses.json",
    JSON.stringify(addresses, null, 2)
  );
  
  fs.writeFileSync(
    "./src/deployedAddresses.json",
    JSON.stringify(addresses, null, 2)
  );

  console.log("\nContract Addresses:");
  console.log("===================");
  console.log("TK1:", tk1.address);
  console.log("TK2:", tk2.address);
  console.log("Faucet:", faucet.address);
  console.log("\nAddresses saved to public/deployedAddresses.json and src/deployedAddresses.json");
  console.log("\nNext steps:");
  console.log("1. Update your frontend with these new addresses");
  console.log("2. Use the depositTokens function to fund the faucet");
  console.log("   - Approve the Faucet contract to spend your tokens");
  console.log("   - Call depositTokens(true, amount) for TK1");
  console.log("   - Call depositTokens(false, amount) for TK2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  