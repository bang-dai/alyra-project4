const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Wcdo Official collection Test", function () {
        let deployer, user1, Wcdo
        const baseURI = "ipfs://bafybeic2mzphelh5foc7kwcb7vsqvfweekahy6ccb4ecyu2cj5fj5zisve/"

        before(async () => {
            [deployer, user1] = await ethers.getSigners()

            //get NFTMarketPlace address
            await deployments.fixture(["Wcdo"]);
            Wcdo = await ethers.getContract("Wcdo")
        })

        describe("Mint new NFT", function () {
            it("Should set new URI", async function () {
                const tx = await Wcdo.setBaseURI(baseURI)
                await tx.wait()
            })

            it("Should get URI", async function () {
                const uri = await Wcdo.getBaseURI()
                assert.equal(uri, baseURI)
            })

            it("Should revert URI because no existent nft", async function () {
                const tx = Wcdo.tokenURI(0)
                await expect(tx).to.be.revertedWith("URI query for nonexistent token");
            })

            it("Should revert because exceed qt per person", async function () {
                const tx = Wcdo.mint(10)
                await expect(tx).to.be.revertedWith("You can only mint 2 NFTs");
            })

            it("Should mint one NFT", async function () {
                const tx = await Wcdo.mint(1)
                await tx.wait()
            })

            it("Should get correct URI for nft #0", async function () {
                const uri = await Wcdo.tokenURI(0)
                assert.equal(uri, `${baseURI}0.json`)
            })
        })
    })