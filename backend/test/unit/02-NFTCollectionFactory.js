const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT Collection Factory", function () {
        let NFTCollectionFactory, owner, NFTMarketPlaceAddr

        before(async () => {
            [owner] = await ethers.getSigners()

            const NFTMarketPlace = await deployments.get("NFTMarketPlace")
            NFTMarketPlaceAddr = NFTMarketPlace.address
            console.log("NFTMarketPlace is: " + NFTMarketPlaceAddr)

            await deployments.fixture(["NFTCollectionFactory"])
            NFTCollectionFactory = await ethers.getContract("NFTCollectionFactory")
        })

        describe("Create new collection", function () {
            it("Should create collection with name and symbol", async function () {
                const name = "coolcat"
                const symbol = "cc"
                const tx = await NFTCollectionFactory.deploy(name, symbol, NFTMarketPlaceAddr)
                await expect(tx).to.emit(NFTCollectionFactory, "NFTCollectionCreated")
            })
        })
    })