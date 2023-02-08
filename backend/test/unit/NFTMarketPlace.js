const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT market place", function () {
        let NFTMarketPlace, deployer, user1, user2
        const baseURI = "https://uri.com/"

        const createNFT = async () => {
            const tx = await NFTMarketPlace.createNFT(baseURI)
            await expect(tx).to.emit(NFTMarketPlace, "NFTCreated").withArgs(0, baseURI)
            const receipt = await tx.wait()
            return receipt.events[0].args.tokenId
        }

        before(async () => {
            [deployer, user1, user2] = await ethers.getSigners()
        })

        describe("CreateNFT", function () {
            beforeEach(async () => {
                await deployments.fixture(["NFTMarketPlace"])
                NFTMarketPlace = await ethers.getContract("NFTMarketPlace")
            })

            it("Should create with correct URI and owner", async function () {
                const tokenId = await createNFT()
                const mintedUri = await NFTMarketPlace.tokenURI(tokenId)
                assert.equal(mintedUri, baseURI)
            })
        })

        describe("ListNFT", function () {
            beforeEach(async () => {
                await deployments.fixture(["NFTMarketPlace"])
                NFTMarketPlace = await ethers.getContract("NFTMarketPlace")
            })

            it("should revert if price is zero", async function () {
                const tokenId = await createNFT()
                const tx = NFTMarketPlace.listNFT(tokenId, 0)
                await expect(tx).to.be.revertedWith("Price must be greater than 0.");
            })

            it("should revert if not the owner", async function () {
                const tokenId = await createNFT()
                const tx = NFTMarketPlace.connect(user1).listNFT(tokenId, 10)
                await expect(tx).to.be.revertedWith("ERC721: approve caller is not token owner or approved for all");
            })

            it("should list correctly", async function () {
                const tokenId = await createNFT()
                const tx = await NFTMarketPlace.listNFT(tokenId, 10)
                await expect(tx).to.emit(NFTMarketPlace, "NFTListed").withArgs(tokenId, 10)
            })
        })

    })