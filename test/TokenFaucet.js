const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFaucet", function () {
  let tokenFaucet;
  let tk1Token;
  let tk2Token;
  let owner;
  let user1;
  let user2;
  const TOKENS_PER_REQUEST = ethers.utils.parseEther("100");
  const INITIAL_SUPPLY = ethers.utils.parseEther("1000000");
  const FAUCET_DEPOSIT = ethers.utils.parseEther("500");

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    
    const Token = await ethers.getContractFactory("Token");
    tk1Token = await Token.deploy("Token1", "TK1");
    tk2Token = await Token.deploy("Token2", "TK2");
    await tk1Token.deployed();
    await tk2Token.deployed();

    const TokenFaucet = await ethers.getContractFactory("TokenFaucet");
    tokenFaucet = await TokenFaucet.deploy(tk1Token.address, tk2Token.address);
    await tokenFaucet.deployed();

    await tk1Token.approve(tokenFaucet.address, FAUCET_DEPOSIT);
    await tk2Token.approve(tokenFaucet.address, FAUCET_DEPOSIT);
    await tokenFaucet.depositTokens(true, FAUCET_DEPOSIT);
    await tokenFaucet.depositTokens(false, FAUCET_DEPOSIT);
  });

  describe("Initialization", function () {
    it("Should set the right owner", async function () {
      expect(await tokenFaucet.owner()).to.equal(owner.address);
    });

    it("Should set correct token addresses", async function () {
      expect(await tokenFaucet.tk1Token()).to.equal(tk1Token.address);
      expect(await tokenFaucet.tk2Token()).to.equal(tk2Token.address);
    });

    it("Should have correct token distribution after setup", async function () {
      expect(await tk1Token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY.sub(FAUCET_DEPOSIT));
      expect(await tk2Token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY.sub(FAUCET_DEPOSIT));
      expect(await tk1Token.balanceOf(tokenFaucet.address)).to.equal(FAUCET_DEPOSIT);
      expect(await tk2Token.balanceOf(tokenFaucet.address)).to.equal(FAUCET_DEPOSIT);
    });
  });

  describe("Token Requests", function () {
    it("Should allow requesting TK1 tokens", async function () {
      await expect(tokenFaucet.connect(user1).requestTokens(true))
        .to.emit(tokenFaucet, "TokensRequested")
        .withArgs(user1.address, true, TOKENS_PER_REQUEST);
      
      expect(await tk1Token.balanceOf(user1.address)).to.equal(TOKENS_PER_REQUEST);
    });

    it("Should prevent requesting TK1 tokens twice", async function () {
      await tokenFaucet.connect(user1).requestTokens(true);
      await expect(
        tokenFaucet.connect(user1).requestTokens(true)
      ).to.be.revertedWith("Address has already received TK1 tokens");
    });

    it("Should fail when faucet is empty", async function () {
      await tokenFaucet.withdrawTokens(true, FAUCET_DEPOSIT);
      await expect(
        tokenFaucet.connect(user1).requestTokens(true)
      ).to.be.revertedWith("Insufficient tokens in the faucet");
    });
  });

describe("Admin Functions", function () {
    it("Should allow owner to deposit tokens", async function () {
      const depositAmount = ethers.utils.parseEther("100");
      await tk1Token.approve(tokenFaucet.address, depositAmount);
      await expect(tokenFaucet.depositTokens(true, depositAmount))
        .to.emit(tokenFaucet, "TokensDeposited")
        .withArgs(tk1Token.address, depositAmount);
    });

    it("Should allow owner to withdraw tokens", async function () {
      const withdrawAmount = ethers.utils.parseEther("100");
      await expect(tokenFaucet.withdrawTokens(true, withdrawAmount))
        .to.emit(tokenFaucet, "TokensWithdrawn")
        .withArgs(tk1Token.address, withdrawAmount);
    });

    it("Should allow removing address from whitelist", async function () {
      await tokenFaucet.connect(user1).requestTokens(true);
      await tokenFaucet.removeFromWhitelist(user1.address, true);
      await expect(tokenFaucet.connect(user1).requestTokens(true))
        .to.not.be.revertedWith("Address has already received TK1 tokens");
    });

    it("Should prevent non-owners from calling admin functions", async function () {
      await expect(
        tokenFaucet.connect(user1).depositTokens(true, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        tokenFaucet.connect(user1).withdrawTokens(true, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        tokenFaucet.connect(user1).removeFromWhitelist(user2.address, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
});
describe("Advanced Token Operations", function () {
    it("Should track balances correctly after multiple requests", async function () {
        const initialFaucetBalance = await tk1Token.balanceOf(tokenFaucet.address);
        
        await tokenFaucet.connect(user1).requestTokens(true);
        const balanceAfterFirst = await tk1Token.balanceOf(tokenFaucet.address);
        expect(balanceAfterFirst).to.equal(initialFaucetBalance.sub(TOKENS_PER_REQUEST));
        
        await tokenFaucet.connect(user2).requestTokens(true);
        const balanceAfterSecond = await tk1Token.balanceOf(tokenFaucet.address);
        expect(balanceAfterSecond).to.equal(balanceAfterFirst.sub(TOKENS_PER_REQUEST));
    });

    it("Should handle TK1 and TK2 independently", async function () {
        await tokenFaucet.connect(user1).requestTokens(true); // Request TK1
        await tokenFaucet.connect(user1).requestTokens(false); // Request TK2
        
        expect(await tk1Token.balanceOf(user1.address)).to.equal(TOKENS_PER_REQUEST);
        expect(await tk2Token.balanceOf(user1.address)).to.equal(TOKENS_PER_REQUEST);
        
        // Should prevent second request for either token
        await expect(tokenFaucet.connect(user1).requestTokens(true))
            .to.be.revertedWith("Address has already received TK1 tokens");
        await expect(tokenFaucet.connect(user1).requestTokens(false))
            .to.be.revertedWith("Address has already received TK2 tokens");
    });

    it("Should prevent withdrawing more than available balance", async function () {
        const excessAmount = FAUCET_DEPOSIT.add(ethers.utils.parseEther("1"));
        await expect(tokenFaucet.withdrawTokens(true, excessAmount))
            .to.be.revertedWith("Insufficient tokens in the faucet");
    });

    it("Should allow withdrawal after whitelist removal and new request", async function () {
        await tokenFaucet.connect(user1).requestTokens(true);
        await tokenFaucet.removeFromWhitelist(user1.address, true);
        await tokenFaucet.connect(user1).requestTokens(true);
        
        expect(await tk1Token.balanceOf(user1.address))
            .to.equal(TOKENS_PER_REQUEST.mul(2));
    });
});
describe("Security Tests", function () {
    let attacker;
    
    beforeEach(async function () {
        [owner, user1, user2, attacker] = await ethers.getSigners();
    });

    it("Should validate proper approvals for deposits", async function () {
        const amount = ethers.utils.parseEther("100");
        await expect(
            tokenFaucet.depositTokens(true, amount)
        ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should protect against unauthorized withdrawals", async function () {
        const amount = ethers.utils.parseEther("100");
        await expect(
            tokenFaucet.connect(attacker).withdrawTokens(true, amount)
        ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should maintain correct state after multiple operations", async function () {
        await tokenFaucet.connect(user1).requestTokens(true);
        await tokenFaucet.removeFromWhitelist(user1.address, true);
        const canRequestAgain = await tokenFaucet.hasReceivedTK1(user1.address);
        expect(canRequestAgain).to.be.false;
    });
});
});