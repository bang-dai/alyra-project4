const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    log("--------------------------------------")
    arguments = ["ipfs://bafybeic2mzphelh5foc7kwcb7vsqvfweekahy6ccb4ecyu2cj5fj5zisve/"]
    const Wcdo = await deploy("Wcdo", {
        from: deployer,
        args: arguments,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    //Verify the smart contract 
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN) {
        log("Verifying...")
        await verify(Wcdo.address, arguments)
    }
}

module.exports.tags = ["all", "Wcdo", "main"]
