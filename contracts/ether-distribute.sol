// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EtherDistribute {
    using SafeMath for uint;

    // Variables
    address private admin;

    uint public feeAmount;
    uint public feeRate = 10;

    // Events
    event Distributed(address, uint);
    event FeeWithdrawn(address, uint);

    constructor() {
        admin = msg.sender;
    }

    function getAdmin() external view returns (address) {
        return admin;
    }

    function distributeEth(address[] calldata users) public payable {
        uint ethDistAmount = msg.value;

        // Validation
        require(ethDistAmount > 0, 'Insuffcient ether balance for distribution');
        
        // Calculate fees.
        uint ethFee = ethDistAmount.mul(feeRate).div(10000);
       
        uint ethToBeDistributed = ethDistAmount - ethFee;
        uint individualEthAmount = ethToBeDistributed.div(users.length);
        for (uint i = 0; i < users.length; i++) {
            address payable _to = payable(users[i]);
            (bool sent, bytes memory _data) = _to.call{value: individualEthAmount}("");
            require(sent, "Failed to send Ether");
            emit Distributed(_to, individualEthAmount);
        }

        feeAmount = feeAmount + ethFee;
    }

    function withdrawFees() public payable {
        require(msg.sender == admin, "Unauthorized");

        address payable _to = payable(msg.sender);
        (bool success, bytes memory _data) = _to.call{value: feeAmount}("");
        require(success, "Failed to withdraw fee");

        emit FeeWithdrawn(msg.sender, feeAmount);
    }
}
