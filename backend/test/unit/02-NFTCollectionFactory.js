const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT MarketPlace Test", function () {
        let deployer, user1, NFTMarketPlace, NFTMarketPlaceAddr, NFTCollectionFactory, NFTCollection, NFTCollectionAddr
        const baseURI = "https://uri.com/"

        const createNFT = async (expectedTokenId) => {
            const tx = await NFTCollection.createNFT(baseURI)
            await expect(tx).to.emit(NFTCollection, "NFTCreated").withArgs(expectedTokenId, baseURI)
            const receipt = await tx.wait()
            return receipt.events[0].args.tokenId
        }

        before(async () => {
            [deployer, user1] = await ethers.getSigners()

            //get NFTMarketPlace address
            await deployments.fixture(["NFTMarketPlace"]);
            NFTMarketPlace = await ethers.getContract("NFTMarketPlace")
            NFTMarketPlaceAddr = NFTMarketPlace.address

            //get NFTCollectionFactory contract
            await deployments.fixture(["NFTCollectionFactory"])
            NFTCollectionFactory = await ethers.getContract("NFTCollectionFactory")
        })

        describe("Create new collection", function () {
            it("Should revert because empty name collection", async function () {
                const tx = NFTCollectionFactory.deploy("", "", NFTMarketPlaceAddr)
                await expect(tx).to.be.revertedWith("Name couldn't be empty!");
            })

            it("Should create collection with name and symbol", async function () {
                const name = "coolcat"
                const symbol = "cc"
                const tx = await NFTCollectionFactory.deploy(name, symbol, NFTMarketPlaceAddr)
                await expect(tx).to.emit(NFTCollectionFactory, "NFTCollectionCreated").withArgs(name, symbol)
                const receipt = await tx.wait()

                NFTCollectionAddr = receipt.events[2].args.addr
                NFTCollection = await ethers.getContractAt("NFTCollection", NFTCollectionAddr, deployer)
            })
        })

        describe("CreateNFT", function () {
            it("Should create with correct URI and owner", async function () {
                const tokenId = await createNFT(0)
                const mintedUri = await NFTCollection.tokenURI(tokenId)
                assert.equal(mintedUri, baseURI)
            })
        })

        describe("ListNFT", function () {
            it("should revert if price is zero", async function () {
                const tokenId = await createNFT(1)
                const tx = NFTMarketPlace.listNFT(tokenId, 0, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("Price must be greater than 0.");
            })

            it("should revert if not the owner", async function () {
                const tokenId = await createNFT(2)
                const tx = NFTMarketPlace.connect(user1).listNFT(tokenId, 10, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("ERC721: transfer from incorrect owner");
            })

            it("should list correctly and transfert NFT to MarketPlace", async function () {
                const tokenId = await createNFT(3)
                const tx = await NFTMarketPlace.listNFT(tokenId, 10, NFTCollectionAddr)
                await expect(tx).to.emit(NFTMarketPlace, "NFTListed").withArgs(tokenId, 10)

                //check if new owner has nft
                const ownerAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(ownerAddr, NFTMarketPlace.address)
            })
        })

        describe("BuyNFT", function () {
            it("Should revert if NFT is not listed", async function () {
                const tx = NFTMarketPlace.buyNFT(123, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("NFT not listed for sale!");
            })

            it("Should revert if price sent is not the same as NFT price", async function () {
                const tokenId = await createNFT(4)
                const tx = await NFTMarketPlace.listNFT(tokenId, 10, NFTCollectionAddr)
                await tx.wait()
                const transaction = NFTMarketPlace.buyNFT(tokenId, NFTCollectionAddr, { value: 9 })
                await expect(transaction).to.be.revertedWith("Your price is incorrect!");
            })

            it("Should transfert NFT to buyer and the money to seller", async function () {
                const price = "10"; //10eth
                //owner paid gas fee
                const tokenId = await createNFT(5)
                const tx = await NFTMarketPlace.listNFT(tokenId, ethers.utils.parseEther(price), NFTCollectionAddr) //convert price to wei
                await tx.wait()

                //owner balance is now clean
                const sellerOldBalance = await deployer.getBalance()
                const transaction = await NFTMarketPlace.connect(user1).buyNFT(tokenId, NFTCollectionAddr, { value: ethers.utils.parseEther(price) })
                //check event
                await expect(transaction).to.emit(NFTMarketPlace, "NFTTransfer").withArgs(tokenId, user1.address)
                await transaction.wait()
                //check seller receive money
                const sellerNewBalance = await deployer.getBalance()
                const profit = sellerNewBalance.sub(sellerOldBalance).toString()
                assert.equal(profit, ethers.utils.parseEther(price).toString())
                //check if new owner has nft
                const ownerAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(ownerAddr, user1.address)
            })
        })
    })