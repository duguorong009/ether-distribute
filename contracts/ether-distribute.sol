// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EtherDistribute {
    using SafeMath for uint;

    // Variables
    address private admin;

    uint public ethAmount;
    uint public feeAmount;

    address[] private users;

    // Events
    event Received(address, uint);
    event UserAdded(address, uint);

    constructor() {
        admin = msg.sender;
    }

    function getAdmin() external view returns (address) {
        return admin;
    }

    function addUser(address newUser) public {
        users.push(newUser);
        emit UserAdded(newUser, users.length);
    }

    receive() external payable {
        ethAmount = ethAmount.add(msg.value);
        emit Received(msg.sender, msg.value);
    }
}
