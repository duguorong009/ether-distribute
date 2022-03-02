// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract EtherDistribute {

    address private admin;

    constructor() {
        admin = msg.sender;
    }

    function getAdmin() external view returns (address) {
        return admin;
    }
}
