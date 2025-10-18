// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title DEX
 * @dev Automated Market Maker (AMM) DEX contract for privacy-preserving swaps
 * Implements constant product formula (x * y = k) for token swaps
 */
contract DEX {
    IERC20 public token;
    uint public totalLiquidity;
    mapping(address => uint) public liquidity;

    event Deposit(address indexed provider, uint ethAmount, uint tokenAmount, uint lpTokens);
    event Withdraw(address indexed provider, uint lpAmount, uint ethAmount, uint tokenAmount);
    event EthToTokenSwap(address indexed user, uint ethInput, uint tokenOutput);
    event TokenToEthSwap(address indexed user, uint tokenInput, uint ethOutput);

    constructor(address _tokenAddress) {
        token = IERC20(_tokenAddress);
    }

    function deposit(uint _tokenAmount) public payable {
        if (totalLiquidity == 0) {
            require(msg.value > 0 && _tokenAmount > 0, "Invalid initial liquidity");
            totalLiquidity = address(this).balance;
            liquidity[msg.sender] += msg.value;
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            emit Deposit(msg.sender, msg.value, _tokenAmount, msg.value);
        } else {
            uint ethReserve = address(this).balance - msg.value;
            uint tokenReserve = token.balanceOf(address(this));
            require(ethReserve > 0 && tokenReserve > 0, "Reserves cannot be zero");
            uint expectedTokenAmount = (msg.value * tokenReserve) / ethReserve;
            require(_tokenAmount >= expectedTokenAmount, "Insufficient token amount");
            uint lpTokensToMint = (msg.value * totalLiquidity) / ethReserve;
            liquidity[msg.sender] += lpTokensToMint;
            totalLiquidity += lpTokensToMint;
            token.transferFrom(msg.sender, address(this), _tokenAmount);
            emit Deposit(msg.sender, msg.value, _tokenAmount, lpTokensToMint);
        }
    }

    function ethToTokenSwap() public payable {
        uint ethReserve = address(this).balance - msg.value;
        uint tokenReserve = token.balanceOf(address(this));
        
        uint inputAmountWithFee = msg.value * 997;
        uint numerator = inputAmountWithFee * tokenReserve;
        uint denominator = (ethReserve * 1000) + inputAmountWithFee;
        uint outputTokens = numerator / denominator;
        
        token.transfer(msg.sender, outputTokens);
        emit EthToTokenSwap(msg.sender, msg.value, outputTokens);
    }

    
    function getReserves() public view returns (uint ethReserve, uint tokenReserve) {
        return (address(this).balance, token.balanceOf(address(this)));
    }

    function tokenToEthSwap(uint256 tokenInput) public {
        require(tokenInput > 0, "Input must be > 0");
        uint256 tokenReserve = token.balanceOf(address(this));
        uint256 ethReserve = address(this).balance;
        require(tokenReserve > 0 && ethReserve > 0, "No liquidity");

        uint256 tokenInputWithFee = tokenInput * 997;
        uint256 numerator = tokenInputWithFee * ethReserve;
        uint256 denominator = (tokenReserve * 1000) + tokenInputWithFee;
        uint256 ethOutput = numerator / denominator;

        require(ethOutput > 0, "Output must be > 0");

        bool success = token.transferFrom(msg.sender, address(this), tokenInput);
        require(success, "Token transfer failed");
        payable(msg.sender).transfer(ethOutput);
        
        emit TokenToEthSwap(msg.sender, tokenInput, ethOutput);
    }

    function withdraw(uint lpAmount) public {
        require(liquidity[msg.sender] >= lpAmount, "Insufficient liquidity");
        uint ethAmount = (lpAmount * address(this).balance) / totalLiquidity;
        uint tokenAmount = (lpAmount * token.balanceOf(address(this))) / totalLiquidity;

        liquidity[msg.sender] -= lpAmount;
        totalLiquidity -= lpAmount;

        payable(msg.sender).transfer(ethAmount);
        require(token.transfer(msg.sender, tokenAmount), "Token transfer failed");
        
        emit Withdraw(msg.sender, lpAmount, ethAmount, tokenAmount);
    }
}
