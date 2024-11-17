// SPDX-License-Identifier: ISC
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleFaucet is ReentrancyGuard, Ownable {
    IERC20 public immutable tokenA;
    IERC20 public immutable tokenB;
    uint256 public constant TOKENS_PER_REQUEST = 100 * 10**18; // 100 tokens
    uint256 public constant COOLDOWN_PERIOD = 24 hours;
    
    mapping(address => uint256) public lastRequestTime;

    event TokensDispensed(address indexed user, uint256 amount);

    constructor(address _tokenA, address _tokenB) {
        require(_tokenA != address(0) && _tokenB != address(0), "Invalid token addresses");
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function requestTokens() external nonReentrant {
        require(block.timestamp >= lastRequestTime[msg.sender] + COOLDOWN_PERIOD, 
                "Please wait 24 hours between requests");
                
        require(
            tokenA.balanceOf(address(this)) >= TOKENS_PER_REQUEST &&
            tokenB.balanceOf(address(this)) >= TOKENS_PER_REQUEST,
            "Faucet needs refill"
        );

        lastRequestTime[msg.sender] = block.timestamp;
        
        require(
            tokenA.transfer(msg.sender, TOKENS_PER_REQUEST) &&
            tokenB.transfer(msg.sender, TOKENS_PER_REQUEST),
            "Transfer failed"
        );

        emit TokensDispensed(msg.sender, TOKENS_PER_REQUEST);
    }

    // Simple withdrawal function for owner
    function withdraw() external onlyOwner {
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));
        
        if (balanceA > 0) tokenA.transfer(msg.sender, balanceA);
        if (balanceB > 0) tokenB.transfer(msg.sender, balanceB);
    }

    // View function to check when user can request again
    function getTimeUntilNextRequest(address user) external view returns (uint256) {
        uint256 lastRequest = lastRequestTime[user];
        if (lastRequest == 0) return 0;
        
        uint256 nextValidRequest = lastRequest + COOLDOWN_PERIOD;
        if (block.timestamp >= nextValidRequest) return 0;
        
        return nextValidRequest - block.timestamp;
    }
}



