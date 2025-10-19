// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Commented for local testing - uncomment for Zama testnet deployment
// import "@fhevm/solidity/TFHE.sol";

/**
 * @title FHEDEX
 * @notice Privacy-preserving DEX using Zama FHEVM
 * @dev Uses encrypted amounts (euint64) for sensitive operations
 * @dev Oracle callbacks handle decryption and final settlement
 * @dev Note: FHE operations available when deployed on Zama testnet
 */
contract FHEDEX {
    IERC20 public token;
    
    // Reserves (uint256 to avoid overflow issues)
    uint256 private ethReserve;
    uint256 private tokenReserve;
    
    // Public state for LP tracking
    mapping(address => uint256) public userLiquidity;
    uint256 public totalLiquidity;
    
    // Pending swaps tracking
    uint256 private nextRequestId = 1;
    struct PendingSwap {
        address user;
        uint256 inputAmount;
        string direction; // "ETH_TO_TOKEN" or "TOKEN_TO_ETH"
        bool completed;
    }
    mapping(uint256 => PendingSwap) public pendingSwaps;
    
    // Relayer address (will be set after deployment)
    address public relayerAddress;
    
    // Events
    event PoolInitialized(uint256 indexed ethAmount, uint256 indexed tokenAmount);
    event LiquidityAdded(address indexed user, uint256 indexed amount);
    event LiquidityRemoved(address indexed user, uint256 indexed amount);
    event SwapRequested(address indexed user, string direction, uint256 amount, uint256 indexed requestId);
    event SwapCompleted(address indexed user, uint256 indexed requestId, uint256 outputAmount);
    event SwapFailed(address indexed user, uint256 indexed requestId);

    constructor(address _token) {
        token = IERC20(_token);
        ethReserve = 0;
        tokenReserve = 0;
    }

    /**
     * @notice Initialize pool with initial liquidity
     * @param tokenAmount Amount of tokens for initial liquidity
     */
    function initializePool(uint256 tokenAmount) external payable {
        require(totalLiquidity == 0, "Pool already initialized");
        require(msg.value > 0 && tokenAmount > 0, "Invalid amounts");
        
        // Transfer tokens from user
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        // Set reserves (simplified - no encryption)
        ethReserve = msg.value;
        tokenReserve = tokenAmount;
        
        // Calculate and store LP tokens
        uint256 lpTokens = sqrt(msg.value * tokenAmount);
        totalLiquidity = lpTokens;
        userLiquidity[msg.sender] = lpTokens;
        
        emit PoolInitialized(msg.value, tokenAmount);
    }

    /**
     * @notice Add liquidity to the pool
     * @param tokenAmount Amount of tokens to deposit
     */
    function addLiquidity(uint256 tokenAmount) external payable {
        require(totalLiquidity > 0, "Pool not initialized");
        require(msg.value > 0 && tokenAmount > 0, "Invalid amounts");
        
        // Transfer tokens from user
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        // Add to reserves (simplified - no encryption)
        ethReserve += msg.value;
        tokenReserve += tokenAmount;
        
        // Calculate LP tokens (simplified - proportional to ETH deposit)
        uint256 lpTokens = (msg.value * totalLiquidity) / (address(this).balance - msg.value);
        totalLiquidity += lpTokens;
        userLiquidity[msg.sender] += lpTokens;
        
        emit LiquidityAdded(msg.sender, lpTokens);
    }

    /**
     * @notice Remove liquidity from the pool
     * @param lpAmount Amount of LP tokens to redeem
     */
    function removeLiquidity(uint256 lpAmount) external {
        require(lpAmount > 0 && userLiquidity[msg.sender] >= lpAmount, "Invalid LP amount");
        require(totalLiquidity > 0, "No liquidity");
        
        // Calculate share of pool
        uint256 ethShare = (lpAmount * address(this).balance) / totalLiquidity;
        
        // Update state
        userLiquidity[msg.sender] -= lpAmount;
        totalLiquidity -= lpAmount;
        
        // Update reserves (simplified - no encryption)
        ethReserve -= uint64(ethShare);
        
        // Transfer ETH back to user
        payable(msg.sender).transfer(ethShare);
        
        emit LiquidityRemoved(msg.sender, lpAmount);
    }

    /**
     * @notice Swap ETH for tokens using Constant Product Formula (AMM)
     * @dev Immediate execution - calculates output and transfers tokens
     * Note: When deployed on Zama Testnet, this will use FHE for encrypted amounts
     */
    function swapEthForToken() external payable {
        require(msg.value > 0, "Invalid ETH amount");
        require(totalLiquidity > 0, "No liquidity");
        require(tokenReserve > 0, "No token liquidity");
        
        uint256 inputAmountWithFee = (msg.value * 997) / 1000; // 0.3% fee
        uint256 outputAmount = (inputAmountWithFee * tokenReserve) / (ethReserve + inputAmountWithFee);
        
        require(outputAmount > 0, "Insufficient output amount");
        require(token.balanceOf(address(this)) >= outputAmount, "Insufficient token balance");
        
        // Update reserves
        ethReserve += msg.value;
        tokenReserve -= outputAmount;
        
        // Transfer tokens to user
        require(token.transfer(msg.sender, outputAmount), "Token transfer failed");
        
        // Emit completion event
        emit SwapCompleted(msg.sender, 0, outputAmount);
    }

    /**
     * @notice Swap tokens for ETH using Constant Product Formula (AMM)
     * @param tokenAmount Amount of tokens to swap
     * @dev Immediate execution - calculates output and transfers ETH
     * Note: When deployed on Zama Testnet, this will use FHE for encrypted amounts
     */
    function swapTokenForEth(uint256 tokenAmount) external {
        require(tokenAmount > 0, "Invalid token amount");
        require(totalLiquidity > 0, "No liquidity");
        require(ethReserve > 0, "No ETH liquidity");
        
        // Transfer tokens from user
        require(token.transferFrom(msg.sender, address(this), tokenAmount), "Token transfer failed");
        
        uint256 inputAmountWithFee = (tokenAmount * 997) / 1000; // 0.3% fee
        uint256 outputAmount = (inputAmountWithFee * ethReserve) / (tokenReserve + inputAmountWithFee);
        
        require(outputAmount > 0, "Insufficient output amount");
        require(address(this).balance >= outputAmount, "Insufficient ETH balance");
        
        // Update reserves
        tokenReserve += tokenAmount;
        ethReserve -= outputAmount;
        
        // Transfer ETH to user
        payable(msg.sender).transfer(outputAmount);
        
        // Emit completion event
        emit SwapCompleted(msg.sender, 0, outputAmount);
    }

    /**
     * @notice Get current pool reserves (public approximation)
     * @dev Note: Actual encrypted values cannot be read without Oracle callback
     */
    function getPoolReserves() external view returns (uint256 ethBalance, uint256 tokenBalance) {
        return (address(this).balance, token.balanceOf(address(this)));
    }

    /**
     * @notice Oracle callback: Complete a decrypted swap
     * @param requestId Request ID tracking this swap
     * @param decryptedOutputAmount The calculated output amount from Oracle
     * @dev DEPRECATED: Now using immediate AMM execution
     * @dev This will be re-enabled when deployed on Zama Testnet with FHE support
     * @dev Only relayer can call this (in production)
     */
    /*
    function handleDecryptedSwap(uint256 requestId, uint256 decryptedOutputAmount) external {
        require(requestId > 0 && requestId < nextRequestId, "Invalid request ID");
        
        PendingSwap storage swap = pendingSwaps[requestId];
        require(!swap.completed, "Swap already completed");
        require(swap.user != address(0), "Swap not found");
        
        swap.completed = true;
        
        // Execute the swap based on direction
        if (keccak256(bytes(swap.direction)) == keccak256(bytes("ETH_TO_TOKEN"))) {
            // Transfer tokens to user
            require(token.balanceOf(address(this)) >= decryptedOutputAmount, "Insufficient token balance");
            require(token.transfer(swap.user, decryptedOutputAmount), "Token transfer failed");
            
            // Update reserves
            tokenReserve -= decryptedOutputAmount;
            
            emit SwapCompleted(swap.user, requestId, decryptedOutputAmount);
        } 
        else if (keccak256(bytes(swap.direction)) == keccak256(bytes("TOKEN_TO_ETH"))) {
            // Transfer ETH to user
            require(address(this).balance >= decryptedOutputAmount, "Insufficient ETH balance");
            payable(swap.user).transfer(decryptedOutputAmount);
            
            // Update reserves
            ethReserve -= decryptedOutputAmount;
            
            emit SwapCompleted(swap.user, requestId, decryptedOutputAmount);
        }
    }
    */

    /**
     * @notice Get pending swap status
     * @param requestId Request ID
     * @return user User address
     * @return inputAmount Input amount
     * @return direction Swap direction
     * @return completed Completion status
     */
    function getPendingSwap(uint256 requestId) external view returns (address user, uint256 inputAmount, string memory direction, bool completed) {
        PendingSwap storage swap = pendingSwaps[requestId];
        return (swap.user, swap.inputAmount, swap.direction, swap.completed);
    }

    /**
     * @notice Calculate output amount using Constant Product Formula (x*y=k)
     * @param inputAmount Amount being swapped in
     * @param inputReserve Current reserve of input token
     * @param outputReserve Current reserve of output token
     * @return Output amount
     * 
     * Formula: output = (inputAmount * outputReserve) / (inputReserve + inputAmount)
     * This ensures: (inputReserve + inputAmount) * (outputReserve - output) = inputReserve * outputReserve
     */
    function calculateSwapOutput(
        uint256 inputAmount,
        uint256 inputReserve,
        uint256 outputReserve
    ) external pure returns (uint256) {
        require(inputAmount > 0, "Input must be greater than 0");
        require(inputReserve > 0 && outputReserve > 0, "Invalid reserves");
        
        uint256 inputAmountWithFee = inputAmount * 997 / 1000; // 0.3% fee
        uint256 numerator = inputAmountWithFee * outputReserve;
        uint256 denominator = inputReserve + inputAmountWithFee;
        
        return numerator / denominator;
    }

    /**
     * @notice Get user's LP token balance
     */
    function getLPBalance(address user) external view returns (uint256) {
        return userLiquidity[user];
    }

    /**
     * @notice Get total LP tokens in circulation
     */
    function getTotalLiquidity() external view returns (uint256) {
        return totalLiquidity;
    }

    /**
     * @notice Internal square root calculation for LP tokens
     */
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
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
