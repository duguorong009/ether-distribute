// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EtherDistribute {
    using SafeMath for uint;

    // Variables
    address private admin;

    uint public ethAmount;
    uint public feeAmount;
    uint public feeRate = 10;

    address[] private users;

    // Events
    event Received(address, uint);
    event UserAdded(address, uint);
    event Distributed(address, uint);
    event FeeWithdrawn(address, uint);

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

    function distributeEth(uint ethDistAmount) public payable {
        require(ethAmount >= ethDistAmount, 'Insuffcient ether balance for distribution');
        uint ethFee = ethDistAmount.mul(feeRate).div(10000);
        feeAmount = feeAmount + ethFee;

        uint ethToBeDistributed = ethDistAmount - ethFee;
        uint individualEthAmount = ethToBeDistributed.div(users.length);
        for (uint i = 0; i < users.length; i++) {
            address payable _to = payable(users[i]);
            (bool sent, bytes memory _data) = _to.call{value: individualEthAmount}("");
            require(sent, "Failed to send Ether");
            emit Distributed(_to, individualEthAmount);
        }
    }

    function withdrawFees() public payable {
        require(msg.sender == admin, "Unauthorized");

        address payable _to = payable(msg.sender);
        (bool success, bytes memory _data) = _to.call{value: feeAmount}("");
        require(success, "Failed to withdraw fee");
        
        emit FeeWithdrawn(msg.sender, feeAmount);
    }

    receive() external payable {
        ethAmount = ethAmount.add(msg.value);
        emit Received(msg.sender, msg.value);
    }
}
