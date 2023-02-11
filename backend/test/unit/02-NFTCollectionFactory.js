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
                // const contractBalance = await NFTMarketPlace.getBalance()
                // console.log(contractBalance)

                //owner paid gas fee
                const tokenId = await createNFT(5)
                const tx = await NFTMarketPlace.listNFT(tokenId, ethers.utils.parseEther(price), NFTCollectionAddr) //convert price to wei
                await tx.wait()

                //owner balance is now clean because he already paid fee
                const sellerOldBalance = await deployer.getBalance()
                const transaction = await NFTMarketPlace.connect(user1).buyNFT(tokenId, NFTCollectionAddr, { value: ethers.utils.parseEther(price) })

                //check event
                await expect(transaction).to.emit(NFTMarketPlace, "NFTTransfer").withArgs(tokenId, user1.address)
                await transaction.wait()

                //check seller receive money
                const sellerProfit = price * 98 / 100 //seller receive 98% of price, because MP fee is 2%
                const sellerNewBalance = await deployer.getBalance()
                const profit = sellerNewBalance.sub(sellerOldBalance).toString()
                assert.equal(profit, ethers.utils.parseEther(sellerProfit.toString()).toString())

                //check marketplace get 2% fees
                // const plateformeFee = price - sellerProfit
                // const newContractBalance = await NFTMarketPlace.getBalance()
                // console.log(newContractBalance)

                // const earn = newContractBalance.sub(contractBalance)
                // console.log(earn)


                //check if new owner has nft
                const ownerAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(ownerAddr, user1.address)
            })
        })

        describe("CancelListing", function () {
            it("Should revert if NFT is not listed", async function () {
                const tx = NFTMarketPlace.cancelListing(1234, NFTCollectionAddr)
                await expect(tx).to.be.revertedWith("NFT not listed for sale!");
            })

            it("Should revert if caller is not the seller", async function () {
                const price = "10"; //10eth                
                const tokenId = await createNFT(6)
                const tx = await NFTMarketPlace.listNFT(tokenId, ethers.utils.parseEther(price), NFTCollectionAddr) //convert price to wei
                await tx.wait()

                const tx2 = NFTMarketPlace.connect(user1).cancelListing(tokenId, NFTCollectionAddr)
                await expect(tx2).to.be.revertedWith("You are not the owner of this NFT!");
            })

            it("Should transfer ownership back to the seller if everyhing is ok", async function () {
                //create and list NFT
                const price = "10"; //10eth                
                const tokenId = await createNFT(7)
                const tx = await NFTMarketPlace.listNFT(tokenId, ethers.utils.parseEther(price), NFTCollectionAddr) //convert price to wei
                await tx.wait()

                //MarketPlace owner the NFT
                const marketPlaceAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(marketPlaceAddr, NFTMarketPlaceAddr)

                //cancel listing
                const tx2 = await NFTMarketPlace.cancelListing(tokenId, NFTCollectionAddr)
                await expect(tx2).to.emit(NFTMarketPlace, "NFTCancel").withArgs(tokenId, deployer.address)

                //check ownership is back
                const ownerAddr = await NFTCollection.ownerOf(tokenId)
                assert.equal(ownerAddr, deployer.address)
            })

        })

        describe("Withdraw", function () {
            it("Should revert if caller is not the owner", async function () {
                const tx = NFTMarketPlace.connect(user1).withdraw()
                await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
            })

            it("Should withdraw correctly to owner", async function () {
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