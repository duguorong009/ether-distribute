// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EtherDistribute {
    using SafeMath for uint;

    // Variables
    address private admin;

    uint public ethAmount;
    uint public feeAmount;

    // Events
    event Received(address, uint);

    constructor() {
        admin = msg.sender;
    }

    function getAdmin() external view returns (address) {
        return admin;
    }

    receive() external payable {
        ethAmount = ethAmount.add(msg.value);
        emit Received(msg.sender, msg.value);
    }
}
