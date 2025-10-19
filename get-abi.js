const ethers = require("ethers");

// Compile contract to get ABI
const fhedexSource = require("fs").readFileSync("./contracts/FHEDEX.sol", "utf8");

console.log("To get the ABI, we'll use Etherscan. But first, verify contract...");
console.log("Contract address: 0xa013B92c201F4A9BD732615c60FAfb2d2EFba87E");

// Alternatively, build it
const source = `
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract FHEDEX {
    IERC20 public token;
    
    mapping(address => uint256) public userLiquidity;
    uint256 public totalLiquidity;
    
    constructor(address _token) {
        token = IERC20(_token);
    }
    
    function removeLiquidity(uint256 lpAmount) external {
        require(lpAmount > 0 && userLiquidity[msg.sender] >= lpAmount, "Invalid LP amount");
        require(totalLiquidity > 0, "No liquidity");
        
        uint256 ethShare = (lpAmount * address(this).balance) / totalLiquidity;
        uint256 tokenShare = (lpAmount * token.balanceOf(address(this))) / totalLiquidity;
        
        userLiquidity[msg.sender] -= lpAmount;
        totalLiquidity -= lpAmount;
        
        payable(msg.sender).transfer(ethShare);
        require(token.transfer(msg.sender, tokenShare), "Token transfer failed");
    }
}
`;

console.log("Need to verify contract on Etherscan or get ABI from hardhat");
