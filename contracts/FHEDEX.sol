// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract FHEDEX {
    IERC20 public token;
    euint32 private ethReserve;
    euint32 private tokenReserve;
    mapping(address => euint32) private userLiquidity;
    uint public totalLiquidity;

    event PoolInit(uint eth, uint token, uint lp);
    event Deposit(address indexed user, uint lp);
    event Withdraw(address indexed user, uint lp);
    event SwapEthToken(address indexed user, uint ethIn, uint tokenOut);
    event SwapTokenEth(address indexed user, uint tokenIn, uint ethOut);

    constructor(address _token) {
        token = IERC20(_token);
        ethReserve = FHE.asEuint32(0);
        tokenReserve = FHE.asEuint32(0);
    }

    function initPool(uint eth, uint tok) external payable {
        require(msg.value == eth && totalLiquidity == 0);
        require(eth > 0 && tok > 0);
        require(eth <= type(uint32).max && tok <= type(uint32).max);
        
        token.transferFrom(msg.sender, address(this), tok);
        ethReserve = FHE.asEuint32(uint32(eth));
        tokenReserve = FHE.asEuint32(uint32(tok));
        
        uint lp = sqrt(eth * tok);
        totalLiquidity = lp;
        userLiquidity[msg.sender] = FHE.asEuint32(uint32(lp));
        
        emit PoolInit(eth, tok, lp);
    }

    function deposit(uint eth, uint tok) external payable {
        require(msg.value == eth && totalLiquidity > 0);
        require(eth > 0 && tok > 0);
        require(eth <= type(uint32).max && tok <= type(uint32).max);
        
        token.transferFrom(msg.sender, address(this), tok);
        
        euint32 e = FHE.asEuint32(uint32(eth));
        euint32 t = FHE.asEuint32(uint32(tok));
        
        ethReserve = FHE.add(ethReserve, e);
        tokenReserve = FHE.add(tokenReserve, t);
        
        uint old = uint(FHE.decrypt(FHE.sub(ethReserve, e)));
        uint lp = (eth * totalLiquidity) / old;
        totalLiquidity += lp;
        
        userLiquidity[msg.sender] = FHE.add(userLiquidity[msg.sender], FHE.asEuint32(uint32(lp)));
        
        emit Deposit(msg.sender, lp);
    }

    function swapEth() external payable {
        require(msg.value > 0 && msg.value <= type(uint32).max);
        
        euint32 in32 = FHE.asEuint32(uint32(msg.value));
        euint32 fee = FHE.mul(in32, FHE.asEuint32(997));
        euint32 num = FHE.mul(fee, tokenReserve);
        euint32 den = FHE.add(FHE.mul(ethReserve, FHE.asEuint32(1000)), fee);
        uint out = uint(FHE.decrypt(FHE.div(num, den)));
        require(out > 0);
        
        ethReserve = FHE.add(ethReserve, in32);
        tokenReserve = FHE.sub(tokenReserve, FHE.asEuint32(uint32(out)));
        
        token.transfer(msg.sender, out);
        emit SwapEthToken(msg.sender, msg.value, out);
    }

    function swapToken(uint tok) external {
        require(tok > 0 && tok <= type(uint32).max);
        
        euint32 in32 = FHE.asEuint32(uint32(tok));
        euint32 fee = FHE.mul(in32, FHE.asEuint32(997));
        euint32 num = FHE.mul(fee, ethReserve);
        euint32 den = FHE.add(FHE.mul(tokenReserve, FHE.asEuint32(1000)), fee);
        uint out = uint(FHE.decrypt(FHE.div(num, den)));
        require(out > 0);
        
        tokenReserve = FHE.add(tokenReserve, in32);
        ethReserve = FHE.sub(ethReserve, FHE.asEuint32(uint32(out)));
        
        token.transferFrom(msg.sender, address(this), tok);
        payable(msg.sender).transfer(out);
        emit SwapTokenEth(msg.sender, tok, out);
    }

    function withdraw(uint lp) external {
        require(lp > 0 && totalLiquidity > 0);
        
        euint32 user = userLiquidity[msg.sender];
        uint dec = uint(FHE.decrypt(user));
        require(lp <= dec);
        
        uint eth = uint(FHE.decrypt(ethReserve));
        uint tok = uint(FHE.decrypt(tokenReserve));
        
        uint ethOut = (lp * eth) / totalLiquidity;
        uint tokOut = (lp * tok) / totalLiquidity;
        
        totalLiquidity -= lp;
        
        userLiquidity[msg.sender] = FHE.sub(user, FHE.asEuint32(uint32(lp)));
        ethReserve = FHE.sub(ethReserve, FHE.asEuint32(uint32(ethOut)));
        tokenReserve = FHE.sub(tokenReserve, FHE.asEuint32(uint32(tokOut)));
        
        payable(msg.sender).transfer(ethOut);
        token.transfer(msg.sender, tokOut);
        emit Withdraw(msg.sender, lp);
    }

    function getReserves() external view returns (uint, uint) {
        return (uint(FHE.decrypt(ethReserve)), uint(FHE.decrypt(tokenReserve)));
    }

    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    receive() external payable {}
}
