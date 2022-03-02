const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Ether-Distribute contract", function() {
    it("Deployment should be success", async function () {
        const [admin] = await ethers.getSigners()
        
        const ethDistributeFactory = await ethers.getContractFactory("EtherDistribute");

        const ethDistributeContract = await ethDistributeFactory.deploy();

        const contractAdmin = await ethDistributeContract.getAdmin();

        expect(contractAdmin.toString()).to.equal(admin.address.toString());
    });

    it("Should receive Ethers from the user", async function () {
        const [admin, user] = await ethers.getSigners()
        
        const ethDistributeFactory = await ethers.getContractFactory("EtherDistribute");

        const ethDistributeContract = await ethDistributeFactory.deploy();

        await user.sendTransaction({
            to: ethDistributeContract.address,
            value: ethers.utils.parseEther("1.0")
        });

        const contractEthAmount = await ethDistributeContract.ethAmount();
        expect(contractEthAmount.toString()).to.equal(ethers.utils.parseEther("1.0").toString());

    });

    it("Should add users to the list", async function () {
        const [user] = await ethers.getSigners()
        
        const ethDistributeFactory = await ethers.getContractFactory("EtherDistribute");

        const ethDistributeContract = await ethDistributeFactory.deploy();

        const tx = await ethDistributeContract.addUser(user1.address);
        const receipt = await tx.wait();
        const [addedUser, usersListLen] = receipt.events[0].args;

        expect(addedUser.toString()).to.equal(user1.address.toString());
        expect(usersListLen.toString()).to.equal('1');
    });
});