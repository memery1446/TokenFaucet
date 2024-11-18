// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFaucet is Ownable {
    IERC20 public immutable tk1Token;
    IERC20 public immutable tk2Token;
    uint256 public constant TOKENS_PER_REQUEST = 100 * 10**18;

    event TokensRequested(address indexed user, bool isTK1, uint256 amount);
    event TokensDeposited(address indexed token, uint256 amount);

    constructor(address _tk1Token, address _tk2Token) {
        tk1Token = IERC20(_tk1Token);
        tk2Token = IERC20(_tk2Token);
    }

    function requestTokens(bool isTK1) external {
        IERC20 token = isTK1 ? tk1Token : tk2Token;
        require(token.balanceOf(address(this)) >= TOKENS_PER_REQUEST, "Insufficient tokens in the faucet");
        token.transfer(msg.sender, TOKENS_PER_REQUEST);
        emit TokensRequested(msg.sender, isTK1, TOKENS_PER_REQUEST);
    }

    function depositTokens(bool isTK1, uint256 amount) external onlyOwner {
        IERC20 token = isTK1 ? tk1Token : tk2Token;
        require(token.transferFrom(msg.sender, address(this), amount), "Token transfer failed");
        emit TokensDeposited(address(token), amount);
    }
}

