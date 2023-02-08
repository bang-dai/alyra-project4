const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let NFTMarketPlaceAddr;

    log("--------------------------------------")

    // const NFTMarketPlace = await deployments.get("NFTMarketPlace")
    // NFTMarketPlaceAddr = NFTMarketPlace.address

    // log("NFTMarketPlace is: " + NFTMarketPlaceAddr)

    arguments = []
    const NFTCollectionFactory = await deploy("NFTCollectionFactory", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    //Verify the smart contract 
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN) {
        log("Verifying...")
        await verify(NFTCollectionFactory.address, arguments)
    }
}

module.exports.tags = ["all", "NFTCollectionFactory", "main"]
