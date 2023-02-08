const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT market place", function () {
        let NFTMarketPlace, owner, user1, user2
        const baseURI = "https://uri.com/"

        const createNFT = async () => {
            const tx = await NFTMarketPlace.createNFT(baseURI)
            await expect(tx).to.emit(NFTMarketPlace, "NFTCreated").withArgs(0, baseURI)
            const receipt = await tx.wait()
            return receipt.events[0].args.tokenId
        }

        before(async () => {
            [owner, user1, user2] = await ethers.getSigners()
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
                await expect(tx).to.be.revertedWith("ERC721: caller is not token owner or approved");
            })

            it("should list correctly and transfert NFT to MarketPlace", async function () {
                const tokenId = await createNFT()
                const tx = await NFTMarketPlace.listNFT(tokenId, 10)
                await expect(tx).to.emit(NFTMarketPlace, "NFTListed").withArgs(tokenId, 10)

                //check if new owner has nft
                const ownerAddr = await NFTMarketPlace.ownerOf(tokenId)
                assert.equal(ownerAddr, NFTMarketPlace.address)
            })
        })

        describe("BuyNFT", function () {
            beforeEach(async () => {
                await deployments.fixture(["NFTMarketPlace"])
                NFTMarketPlace = await ethers.getContract("NFTMarketPlace")
            })

            it("Should revert if NFT is not listed", async function () {
                const tx = NFTMarketPlace.buyNFT(123)
                await expect(tx).to.be.revertedWith("NFT not listed for sale!");
            })

            it("Should revert if price sent is not the same as NFT price", async function () {
                const tokenId = await createNFT()
                const tx = await NFTMarketPlace.listNFT(tokenId, 10)
                await tx.wait()
                const transaction = NFTMarketPlace.buyNFT(tokenId, { value: 9 })
                await expect(transaction).to.be.revertedWith("Your price is incorrect!");
            })

            it("Should transfert NFT to buyer and the money to seller", async function () {
                const price = "12.5"; //10eth
                //owner paid gas fee
                const tokenId = await createNFT()
                const tx = await NFTMarketPlace.listNFT(tokenId, ethers.utils.parseEther(price)) //convert price to wei
                await tx.wait()

                //owner balance is now clean
                const sellerOldBalance = await owner.getBalance()
                const transaction = await NFTMarketPlace.connect(user1).buyNFT(tokenId, { value: ethers.utils.parseEther(price) })
                //check event
                await expect(transaction).to.emit(NFTMarketPlace, "NFTTransfer").withArgs(tokenId, user1.address)
                await transaction.wait()
                //check seller receive money
                const sellerNewBalance = await owner.getBalance()
                const profit = sellerNewBalance.sub(sellerOldBalance).toString()
                assert.equal(profit, ethers.utils.parseEther(price).toString())
                //check if new owner has nft
                const ownerAddr = await NFTMarketPlace.ownerOf(tokenId)
                assert.equal(ownerAddr, user1.address)

            })
        })

    })