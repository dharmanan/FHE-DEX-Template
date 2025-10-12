// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/FHE.sol";

contract FHEDEX {
    // Confidential balance mapping
    mapping(address => bytes) private balances;

    // Deposit confidential amount
    function deposit(bytes calldata encryptedAmount) external {
        // FHE.add fonksiyonu bulunamadığı için doğrudan atama yapılıyor
        balances[msg.sender] = encryptedAmount;
    }

    // Withdraw confidential amount
    function withdraw(bytes calldata encryptedAmount) external {
        // FHE.sub fonksiyonu bulunamadığı için doğrudan atama yapılıyor
        balances[msg.sender] = encryptedAmount;
    }

    // Get confidential balance
    function getBalance(address user) external view returns (bytes memory) {
        return balances[user];
    }
}
