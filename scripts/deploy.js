const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Existing token addresses on Sepolia
  const TK1_ADDRESS = "0x83948078E863965393309B4E9e2C112F91f9fB14";
  const TK2_ADDRESS = "0xd95E02893187B054dFCb7FAC0862420f727CA484";
  
  console.log("Using existing tokens:");
  console.log("TK1:", TK1_ADDRESS);
  console.log("TK2:", TK2_ADDRESS);

  // Deploy faucet with existing token addresses
  console.log("\nDeploying faucet...");
  const Faucet = await ethers.getContractFactory("TokenFaucet");
  const faucet = await Faucet.deploy(TK1_ADDRESS, TK2_ADDRESS);
  await faucet.deployed();
  console.log("Faucet deployed to:", faucet.address);

  // Save addresses
  const addresses = {
    TK1_ADDRESS: TK1_ADDRESS,
    TK2_ADDRESS: TK2_ADDRESS,
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
  console.log("TK1:", TK1_ADDRESS);
  console.log("TK2:", TK2_ADDRESS);
  console.log("Faucet:", faucet.address);
  
  console.log("\nNext steps:");
  console.log("1. Update your frontend to use these addresses");
  console.log("2. Approve the Faucet contract to spend your tokens using the token contracts");
  console.log("3. Use the depositTokens function to fund the faucet");
  console.log("   - Call depositTokens(true, amount) for TK1");
  console.log("   - Call depositTokens(false, amount) for TK2");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

  