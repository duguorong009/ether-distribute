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
});