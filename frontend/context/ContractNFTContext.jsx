import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Contract from 'contract/example.json' //update here
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
    const contractAddress = process.env.NEXT_PUBLIC_FACTORY_ADD
    const { address, isConnected } = useAccount()
    //get signer && provider to call SC function
    const provider = useProvider()
    const { data: signer } = useSigner()
    //keep our balance up to date
    const { data, isError, isLoading } = useBalance({
        address: address,
        watch: true
    })

    useEffect(() => {
        if (isConnected) {
            //todo refresh only connected
        }
    }, [isConnected, address])

    //Create all SC function here


    return (
        <ContractNFTContext.Provider value={{ contractAddress, Contract, address, isConnected }}>
            {children}
        </ContractNFTContext.Provider>
    )
}

export default ContractNFTContext