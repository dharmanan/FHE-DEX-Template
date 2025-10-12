// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
    IERC20 public token;
    uint public totalLiquidity;
    mapping(address => uint) public liquidity;

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    // Add liquidity
    function deposit(uint _tokenAmount) public payable {
        uint ethReserve = address(this).balance - msg.value;
        uint tokenReserve = token.balanceOf(address(this)) - _tokenAmount;
        
        // First depositor sets the price
        if (totalLiquidity == 0) {
            require(msg.value > 0 && _tokenAmount > 0, "Invalid initial liquidity");
            totalLiquidity = address(this).balance;
            liquidity[msg.sender] += msg.value;
        } else {
            require(ethReserve > 0 && tokenReserve > 0, "Reserves cannot be zero");
            uint expectedTokenAmount = (msg.value * tokenReserve) / ethReserve;
            require(_tokenAmount >= expectedTokenAmount, "Insufficient token amount");

            uint lpTokensToMint = (msg.value * totalLiquidity) / ethReserve;
            liquidity[msg.sender] += lpTokensToMint;
            totalLiquidity += lpTokensToMint;
        }
        
        token.transferFrom(msg.sender, address(this), _tokenAmount);
    }

    // Swap ETH for Token
    function ethToTokenSwap() public payable {
        uint ethReserve = address(this).balance - msg.value;
        uint tokenReserve = token.balanceOf(address(this));
        
        uint inputAmountWithFee = msg.value * 997;
        uint numerator = inputAmountWithFee * tokenReserve;
        uint denominator = (ethReserve * 1000) + inputAmountWithFee;
        uint outputTokens = numerator / denominator;
        
        token.transfer(msg.sender, outputTokens);
    }
}
