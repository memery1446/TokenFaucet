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

  // Fund faucet
  console.log("\nFunding faucet...");
  const amount = ethers.utils.parseEther("1000");
  
  console.log("Transferring TK1...");
  const tx1 = await tk1.transfer(faucet.address, amount);
  await tx1.wait();
  
  console.log("Transferring TK2...");
  const tx2 = await tk2.transfer(faucet.address, amount);
  await tx2.wait();

  // Verify balances
  const tk1Balance = await tk1.balanceOf(faucet.address);
  const tk2Balance = await tk2.balanceOf(faucet.address);
  console.log("\nFaucet balances:");
  console.log("TK1:", ethers.utils.formatEther(tk1Balance));
  console.log("TK2:", ethers.utils.formatEther(tk2Balance));

  // Save addresses
  const addresses = {
    TK1_ADDRESS: tk1.address,
    TK2_ADDRESS: tk2.address,
    FAUCET_ADDRESS: faucet.address
  };

  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public');
  }

  fs.writeFileSync(
    "./public/deployedAddresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("\nAddresses saved to public/deployedAddresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });