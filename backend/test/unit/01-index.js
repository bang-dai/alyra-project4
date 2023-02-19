const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("NFT MarketPlace Test", function () {
        let deployer, user1, user2, NFTMarketPlace, NFTMarketPlaceAddr, NFTCollectionFactory, NFTCollection, NFTCollectionAddr
        const baseURI = "https://uri.com/"
        const imageURL = "https://uri.com/image.png"

        const createNFT = async (expectedTokenId) => {
            const tx = await NFTCollection.connect(user1).createNFT(baseURI)
            await expect(tx).to.emit(NFTCollection, "NFTCreated").withArgs(expectedTokenId, baseURI)
            const receipt = await tx.wait()
            return receipt.events[0].args.tokenId
        }

        before(async () => {
            [deployer, user1, user2] = await ethers.getSigners()

            //get NFTMarketPlace address
            await deployments.fixture(["NFTMarketPlace"]);
            NFTMarketPlace = await ethers.getContract("NFTMarketPlace")
            NFTMarketPlaceAddr = NFTMarketPlace.address

            //get NFTCollectionFactory contract
            await deployments.fixture(["NFTCollectionFactory"])
            NFTCollectionFactory = await ethers.getContract("NFTCollectionFactory")
        })

        describe("Create new collection", function () {
            it("Should revert because empty name and symbol collection", async function () {
                const tx = NFTCollectionFactory.deploy("", "", "", imageURL, user1.address, NFTMarketPlaceAddr)
                await expect(tx).to.be.revertedWith("Name couldn't be empty!");
            })

            it("Should create collection with correct name and symbol", async function () {
                const name = "coolcat"
                const symbol = "cc"
                const desc = "simple description for collection"
                const tx = await NFTCollectionFactory.deploy(name, symbol, desc, imageURL, user1.address, NFTMarketPlaceAddr)
                await expect(tx).to.emit(NFTCollectionFactory, "NFTCollectionCreated").withArgs(name, symbol)
                const receipt = await tx.wait()

                receipt.events.map(event => {
                    if (event.event == "NFTCollectionAddr") {
                        NFTCollectionAddr = event.args.addr
                        return
                    }
                })

                NFTCollection = await ethers.getContractAt("NFTCollection", NFTCollectionAddr, deployer)
            })

            it("Should get the description from collection", async function () {
                const desc = "simple description for collection"
                const expectDesc = await NFTCollection.getDescription()
                assert.equal(expectDesc, desc)
            })

            it("Should get the imageURL from collection", async function () {
                const expectImageURL = await NFTCollection.getImageURL()
                assert.equal(expectImageURL, imageURL)
            })

            it("Should get my collection address", async function () {
                const myCollections = await NFTCollectionFactory.connect(user1).getMyCollections()
                assert.equal(NFTCollectionAddr, myCollections[0])
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
                const tx = NFTMarketPlace.connect(user1).listNFT(tokenId, 0, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("Price must be greater than 0.");
            })

            it("should revert if not the owner", async function () {
                const tokenId = await createNFT(2)
                const tx = NFTMarketPlace.connect(user2).listNFT(tokenId, 10, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("You are not the owner of the token.");
            })

            it("should list correctly on MarketPlace", async function () {
                const tokenId = await createNFT(3)
                const tx = await NFTMarketPlace.connect(user1).listNFT(tokenId, 10, NFTCollectionAddr)
                await expect(tx).to.emit(NFTMarketPlace, "NFTListed").withArgs(tokenId, 10)

                //check if new owner has nft
                // const ownerAddr = await NFTCollection.ownerOf(tokenId)
                // assert.equal(ownerAddr, NFTMarketPlace.address)
            })
        })

        describe("BuyNFT", function () {
            it("Should revert if NFT is not listed", async function () {
                const tx = NFTMarketPlace.connect(user1).buyNFT(123, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("NFT not listed for sale!");
            })

            it("Should revert if price sent is not the same as NFT price", async function () {
                const tokenId = await createNFT(4)
                const tx = await NFTMarketPlace.connect(user1).listNFT(tokenId, 10, NFTCollectionAddr)
                await tx.wait()
                const transaction = NFTMarketPlace.connect(user2).buyNFT(tokenId, NFTCollectionAddr, { value: 9 })
                await expect(transaction).to.be.revertedWith("Your price is incorrect!");
            })

            it("Should transfert NFT to buyer, the money to seller and marketplace earn 2%", async function () {
                const price = "10"; //10eth
                const priceWei = ethers.utils.parseEther(price)
                const contractBalance = await NFTMarketPlace.provider.getBalance(NFTMarketPlaceAddr)

                //owner paid gas fee
                const tokenId = await createNFT(5)
                const tx = await NFTMarketPlace.connect(user1).listNFT(tokenId, priceWei, NFTCollectionAddr) //convert price to wei
                await tx.wait()

                //owner balance is now clean because he already paid fee
                const sellerOldBalance = await user1.getBalance()
                const transaction = await NFTMarketPlace.connect(user2).buyNFT(tokenId, NFTCollectionAddr, { value: priceWei })

                //check event
                await expect(transaction).to.emit(NFTMarketPlace, "NFTTransfer").withArgs(tokenId, user2.address)
                await transaction.wait()

                //check seller receive 98% of his price
                const sellerNewBalance = await user1.getBalance()
                const sellerProfit = priceWei * 98 / 100 //seller receive 98% of price, because MP fee is 2%            
                const profit = sellerNewBalance.sub(sellerOldBalance).toString()
                assert.equal(profit, sellerProfit)

                //check marketplace get 2% fees
                const plateformeFee = priceWei - sellerProfit
                const newContractBalance = await NFTMarketPlace.provider.getBalance(NFTMarketPlaceAddr)
                const earn = newContractBalance.sub(contractBalance).toString()
                assert.equal(earn, plateformeFee)

                //check if new owner has nft
                const ownerAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(ownerAddr, user2.address)
            })

            it("Should revert if buyer attempt to buy his NFT", async function () {
                const price = "10"; //10eth
                const priceWei = ethers.utils.parseEther(price)
                const tokenId = await createNFT(6)
                const tx = await NFTMarketPlace.connect(user1).listNFT(tokenId, priceWei, NFTCollectionAddr)
                await tx.wait()
                const transaction = NFTMarketPlace.connect(user1).buyNFT(tokenId, NFTCollectionAddr, { value: priceWei })
                await expect(transaction).to.be.revertedWith("You can't buy your NFT");
            })
        })

        describe("CancelListing", function () {
            it("Should revert if NFT is not listed", async function () {
                const price = "10"; //10eth                
                const tokenId = await createNFT(7)
                const tx = NFTMarketPlace.connect(user1).cancelListing(7, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("NFT not listed for sale!");
            })

            it("Should revert if caller is not the seller", async function () {
                const price = "10"; //10eth                
                const tokenId = await createNFT(8)
                const tx = await NFTMarketPlace.connect(user1).listNFT(tokenId, ethers.utils.parseEther(price), NFTCollectionAddr) //convert price to wei
                await tx.wait()

                const tx2 = NFTMarketPlace.connect(user2).cancelListing(tokenId, NFTCollectionAddr)
                await expect(tx2).to.be.revertedWith("You are not the owner of the token.");
            })

            it("Should transfer ownership back to the seller if everyhing is ok", async function () {
                //create and list NFT
                const price = "10"; //10eth                
                const tokenId = await createNFT(9)
                const tx = await NFTMarketPlace.connect(user1).listNFT(tokenId, ethers.utils.parseEther(price), NFTCollectionAddr) //convert price to wei
                await tx.wait()

                //I own the NFT
                const marketPlaceAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(marketPlaceAddr, user1.address)

                //cancel listing
                const tx2 = await NFTMarketPlace.connect(user1).cancelListing(tokenId, NFTCollectionAddr)
                await expect(tx2).to.emit(NFTMarketPlace, "NFTCancel").withArgs(tokenId, user1.address)

                //check ownership is back
                const ownerAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(ownerAddr, user1.address)
            })

        })

        describe("Withdraw", function () {
            it("Should revert if caller is not the owner", async function () {
                const tx = NFTMarketPlace.connect(user1).withdraw()
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it("Should withdraw eth to owner", async function () {
                const deployerBalance = await deployer.getBalance()
                const tx = await NFTMarketPlace.withdraw()
                await tx.wait()
                const deployerNewBalance = await deployer.getBalance()
                expect(deployerNewBalance).to.be.greaterThan(deployerBalance)
            })

            it("Should revert if marketplace contract has empty balance", async function () {
                const tx = NFTMarketPlace.withdraw()
                await expect(tx).to.be.revertedWith("Empty balance");
            })
        })

    })