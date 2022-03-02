const { expect } = require('chai');
const { ethers } = require('hardhat');

describe("Ether-Distribute contract", function() {

    let admin;
    let user;
    let ethDistributeFactory;
    let ethDistributeContract;

    beforeEach(async function() {
        [admin, user] = await ethers.getSigners()
        ethDistributeFactory = await ethers.getContractFactory("EtherDistribute");
        ethDistributeContract = await ethDistributeFactory.deploy();
    });

    it("Deployment should be success", async function () {

        const contractAdmin = await ethDistributeContract.admin();
        expect(contractAdmin.toString()).to.equal(admin.address.toString());

    });

    it("Should distribute the Ethers to the users", async function () {

        await expect(ethDistributeContract.distributeEth([user.address], { from: admin.address, value: "0" })).to.be.revertedWith("Insuffcient ether balance for distribution");
        
        const distributeAmount = ethers.utils.parseEther("0.6");
        const tx = await ethDistributeContract.distributeEth([user.address], {from: admin.address, value: distributeAmount});
        const receipt = await tx.wait();
        
        expect(receipt.events.length).to.equal(1);

        const [expectedUser, amount] = receipt.events[0].args;
        expect(expectedUser.toString()).to.equal(user.address.toString());
        expect(amount.toString()).to.equal(ethers.utils.parseEther("0.5994").toString());
    });

    it("Should subtract the fee when distribution", async function () {

        const distributeAmount = ethers.utils.parseEther("0.6");
        const tx = await ethDistributeContract.distributeEth([user.address], {from: admin.address, value: distributeAmount});
        const receipt = await tx.wait();
        
        const [expectedUser, amount] = receipt.events[0].args;
        expect(expectedUser.toString()).to.equal(user.address.toString());
        expect(amount.toString()).to.equal(ethers.utils.parseEther("0.5994").toString());

        const expecteFee = await ethDistributeContract.feeAmount();
        expect(expecteFee.toString()).to.equal(ethers.utils.parseEther("0.0006").toString());
    });

    it("Should withdraw fees", async function () {

        const distributeAmount = ethers.utils.parseEther("0.6");
        await ethDistributeContract.distributeEth([user.address], {from: admin.address, value: distributeAmount});

        
        await expect(ethDistributeContract.connect(user).withdrawFees()).to.be.revertedWith("Unauthorized");


        const tx = await ethDistributeContract.withdrawFees();
        const receipt = await tx.wait();

        const [expectedAdmin, amount] = receipt.events[0].args;
        expect(expectedAdmin.toString()).to.equal(admin.address.toString());
        expect(amount.toString()).to.equal(ethers.utils.parseEther("0.0006").toString());
    });
});