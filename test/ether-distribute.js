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

        const tx = await ethDistributeContract.addUser(user.address);
        const receipt = await tx.wait();
        const [addedUser, usersListLen] = receipt.events[0].args;

        expect(addedUser.toString()).to.equal(user.address.toString());
        expect(usersListLen.toString()).to.equal('1');
    });

    it("Should distribute the Ethers to the users", async function () {
        const [admin, user] = await ethers.getSigners()
        
        const ethDistributeFactory = await ethers.getContractFactory("EtherDistribute");

        const ethDistributeContract = await ethDistributeFactory.deploy();

        await user.sendTransaction({
            to: ethDistributeContract.address,
            value: ethers.utils.parseEther("1.0")
        });

        await ethDistributeContract.addUser(user.address);

        await expect(ethDistributeContract.distributeEth(ethers.utils.parseEther("1.1"))).to.be.revertedWith("Insuffcient ether balance for distribution");
        
        const distributeAmount = ethers.utils.parseEther("0.6");
        const tx = await ethDistributeContract.distributeEth(distributeAmount);
        const receipt = await tx.wait();
        
        expect(receipt.events.length).to.equal(1);

        const [expectedUser, amount] = receipt.events[0].args;
        expect(expectedUser.toString()).to.equal(user.address.toString());
        expect(amount.toString()).to.equal(ethers.utils.parseEther("0.5994").toString());
    });

    it("Should subtract the fee when distribution", async function () {
        const [admin, user] = await ethers.getSigners()
        
        const ethDistributeFactory = await ethers.getContractFactory("EtherDistribute");

        const ethDistributeContract = await ethDistributeFactory.deploy();

        await user.sendTransaction({
            to: ethDistributeContract.address,
            value: ethers.utils.parseEther("1.0")
        });

        await ethDistributeContract.addUser(user.address);
        
        const distributeAmount = ethers.utils.parseEther("0.6");
        const tx = await ethDistributeContract.distributeEth(distributeAmount);
        const receipt = await tx.wait();
        
        const [expectedUser, amount] = receipt.events[0].args;
        expect(expectedUser.toString()).to.equal(user.address.toString());
        expect(amount.toString()).to.equal(ethers.utils.parseEther("0.5994").toString());

        const expecteFee = await ethDistributeContract.feeAmount();
        expect(expecteFee.toString()).to.equal(ethers.utils.parseEther("0.0006").toString());
    });

    it("Should withdraw fees", async function () {
        const [admin, user] = await ethers.getSigners()
        
        const ethDistributeFactory = await ethers.getContractFactory("EtherDistribute");

        const ethDistributeContract = await ethDistributeFactory.deploy();

        await user.sendTransaction({
            to: ethDistributeContract.address,
            value: ethers.utils.parseEther("1.0")
        });

        await ethDistributeContract.addUser(user.address);

        const distributeAmount = ethers.utils.parseEther("0.6");
        await ethDistributeContract.distributeEth(distributeAmount);

        await expect(ethDistributeContract.connect(user).withdrawFees()).to.be.revertedWith("Unauthorized");

        const tx = await ethDistributeContract.withdrawFees();
        const receipt = await tx.wait();

        const [expectedAdmin, amount] = receipt.events[0].args;
        expect(expectedAdmin.toString()).to.equal(admin.address.toString());
        expect(amount.toString()).to.equal(ethers.utils.parseEther("0.0006").toString());
    });
});