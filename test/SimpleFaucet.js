const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DEX Test Faucet", function () {
    let tokenA;
    let tokenB;
    let faucet;
    let owner;
    let user;
    let user2;
    let user3;
    
    const TOKENS_PER_REQUEST = ethers.utils.parseEther("100"); // 100 tokens
    const INITIAL_FAUCET_FUNDING = ethers.utils.parseEther("1000"); // 1000 tokens

    beforeEach(async function () {
        [owner, user, user2, user3] = await ethers.getSigners();

        // Deploy Test Tokens
        const Token = await ethers.getContractFactory("Token");
        tokenA = await Token.deploy("Token A", "MTA");
        tokenB = await Token.deploy("Token B", "MTB");
        
        // Deploy Faucet
        const SimpleFaucet = await ethers.getContractFactory("SimpleFaucet");
        faucet = await SimpleFaucet.deploy(
            tokenA.address,
            tokenB.address
        );

        // Fund the faucet
        await tokenA.transfer(faucet.address, INITIAL_FAUCET_FUNDING);
        await tokenB.transfer(faucet.address, INITIAL_FAUCET_FUNDING);
    });

    describe("Basic Functionality", function () {
        it("Should dispense correct amount of tokens", async function () {
            await faucet.connect(user).requestTokens();
            expect(await tokenA.balanceOf(user.address)).to.equal(TOKENS_PER_REQUEST);
            expect(await tokenB.balanceOf(user.address)).to.equal(TOKENS_PER_REQUEST);
        });

        // ... other basic functionality tests ...
    });

    describe("Multi-User and Security Scenarios", function () {
        it("Should handle multiple users independently", async function () {
            // First user requests
            await faucet.connect(user).requestTokens();
            expect(await tokenA.balanceOf(user.address)).to.equal(TOKENS_PER_REQUEST);

            // Second user should be able to request immediately
            await faucet.connect(user2).requestTokens();
            expect(await tokenA.balanceOf(user2.address)).to.equal(TOKENS_PER_REQUEST);

            // Original user should still be in cooldown
            await expect(
                faucet.connect(user).requestTokens()
            ).to.be.revertedWith("Please wait 24 hours between requests");
        });

        it("Should protect owner functions", async function () {
            await expect(
                faucet.connect(user).withdraw()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should maintain accurate balances across multiple requests", async function () {
                // Get initial balance
                const initialBalance = await tokenA.balanceOf(faucet.address);
                
                // Multiple users request tokens
                await faucet.connect(user).requestTokens();
                await faucet.connect(user2).requestTokens();
                await faucet.connect(user3).requestTokens();

                // Debug log to check types
                console.log('Types:', {
                    initialBalance: typeof initialBalance,
                    TOKENS_PER_REQUEST: typeof TOKENS_PER_REQUEST
                });

                // Make sure everything is BigInt
                const numberOfRequests = BigInt(3);
                const tokensPerRequest = BigInt(TOKENS_PER_REQUEST);
                const totalWithdrawn = tokensPerRequest * numberOfRequests;
                const expectedRemaining = BigInt(initialBalance) - totalWithdrawn;

                // Verify the remaining balance
                const finalBalance = await tokenA.balanceOf(faucet.address);
                expect(finalBalance).to.equal(expectedRemaining);
            });

        it("Should handle rapid sequential requests correctly", async function () {
            const requests = [
                faucet.connect(user).requestTokens(),
                faucet.connect(user2).requestTokens(),
                faucet.connect(user3).requestTokens()
            ];

            await Promise.all(requests);

            expect(await tokenA.balanceOf(user.address)).to.equal(TOKENS_PER_REQUEST);
            expect(await tokenA.balanceOf(user2.address)).to.equal(TOKENS_PER_REQUEST);
            expect(await tokenA.balanceOf(user3.address)).to.equal(TOKENS_PER_REQUEST);
        });
    });

    describe("Edge Cases and Gas Usage", function () {
        it("Should track gas usage for monitoring", async function () {
            const tx = await faucet.connect(user).requestTokens();
            const receipt = await tx.wait();
            
            console.log("Gas used for token request:", receipt.gasUsed.toString());
            expect(receipt.gasUsed).to.be.lt(200000);
        });

        it("Should handle token requests near the cooldown boundary", async function () {
            await faucet.connect(user).requestTokens();
            await time.increase(24 * 3600 - 2);
            
            await expect(
                faucet.connect(user).requestTokens()
            ).to.be.revertedWith("Please wait 24 hours between requests");
            
            await time.increase(3);
            await expect(faucet.connect(user).requestTokens()).to.not.be.reverted;
        });

        it("Should allow withdrawing partial amounts by owner", async function () {
            const initialBalance = await tokenA.balanceOf(faucet.address);
            await faucet.connect(user).requestTokens();
            await faucet.connect(owner).withdraw();
            
            await expect(
                faucet.connect(user2).requestTokens()
            ).to.be.revertedWith("Faucet needs refill");
        });

        it("Should maintain consistent behavior with multiple user interactions", async function () {
            const testUsers = [user, user2, user3];
            
            for (const user of testUsers) {
                await faucet.connect(user).requestTokens();
            }
            
            await time.increase(24 * 3600 + 1);
            
            for (const user of testUsers) {
                await expect(
                    faucet.connect(user).requestTokens()
                ).to.not.be.reverted;
            }
        });
        it("Should not accept direct ETH transfers", async function () {
         await expect(owner.sendTransaction({ to: faucet.address, value: ethers.utils.parseEther("1") })
        ).to.be.reverted;
});
        
        it("Should fail if requesting with zero balance", async function () {
            // Drain the faucet first
            await faucet.connect(owner).withdraw();
            
            // Try to request tokens
            await expect(
                faucet.connect(user).requestTokens()
            ).to.be.revertedWith("Faucet needs refill");
});
    });
});


