// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TokenFaucet {
    IERC20 public tk1Token;
    IERC20 public tk2Token;
    uint256 public constant TOKENS_PER_REQUEST = 100 * 10**18;

    event TokensRequested(address indexed user, bool isTK1, uint256 amount);

    constructor(address _tk1Token, address _tk2Token) {
        tk1Token = IERC20(_tk1Token);
        tk2Token = IERC20(_tk2Token);
    }

    function requestTokens(bool isTK1) external {
        IERC20 token = isTK1 ? tk1Token : tk2Token;
        token.transfer(msg.sender, TOKENS_PER_REQUEST);
        emit TokensRequested(msg.sender, isTK1, TOKENS_PER_REQUEST);
    }
}
