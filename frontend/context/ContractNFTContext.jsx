import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Contract from '../../backend/artifacts/contracts/NFTCollectionFactory.sol/NFTCollectionFactory.json' //update here
import { useAccount, useBalance, useProvider, useSigner } from "wagmi";

const ContractNFTContext = React.createContext(null)

export function useContractNFTProvider() {
    const context = useContext(ContractNFTContext)

    if (!context) {
        throw new Error('useContractNFTProvider must be used within a ContractNFTProvider')
    }
    return context
}

export const ContractNFTProvider = ({ children }) => {
    const contractAddress = process.env.NEXT_PUBLIC_FACTORY_ADDR
    const marketplaceAddr = process.env.NEXT_PUBLIC_MARKETPLACE_ADDR

    const { address, isConnected } = useAccount()
    //get signer && provider to call SC function
    const provider = useProvider()
    const { data: signer } = useSigner()
    //keep our balance up to date
    const { data, isError, isLoading } = useBalance({
        address: address,
        watch: true
    })
    //write contract
    const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
    //read contract
    const contractRead = new ethers.Contract(contractAddress, Contract.abi, provider)


    useEffect(() => {
        if (isConnected) {
            //todo refresh only connected
        }
    }, [isConnected, address])

    //Create all SC function here
    const deploy = async (name, symbol) => {
        const tx = await contract.deploy(name, symbol, marketplaceAddr)
        await tx.wait()
    }


    const getMyCollection = async () => {
        const collections = await contract.getNFTCollections()
        console.log(collections)
    }


    return (
        <ContractNFTContext.Provider value={{ contractAddress, Contract, address, isConnected, deploy, getMyCollection }}>
            {children}
        </ContractNFTContext.Provider>
    )
}

export default ContractNFTContext