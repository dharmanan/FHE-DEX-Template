// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ZamaToken is ERC20 {
    constructor(address initialOwner) ERC20("Zama", "ZAMA") {
        _mint(initialOwner, 5000 * 10**18);
    }
}
