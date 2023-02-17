import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Contract from '../../backend/artifacts/contracts/NFTMarketPlace.sol/NFTMarketPlace.json' //update here
import { useAccount, useBalance, useProvider, useSigner } from "wagmi";

const NFTMarketContext = React.createContext(null)

export function useNFTMarketProvider() {
    const context = useContext(NFTMarketContext)

    if (!context) {
        throw new Error('useNFTMarketProvider must be used within a NFTMarketProvider')
    }
    return context
}

export const NFTMarketProvider = ({ children }) => {
    const marketplaceAddr = process.env.NEXT_PUBLIC_MARKETPLACE_ADDR
    const { address, isConnected } = useAccount()
    //get signer && provider to call SC function
    const provider = useProvider()
    const { data: signer } = useSigner()
    //write contract
    const contract = new ethers.Contract(marketplaceAddr, Contract.abi, signer)
    //read contract
    const contractRead = new ethers.Contract(marketplaceAddr, Contract.abi, provider)



    useEffect(() => {
        if (isConnected) {
        }

        return () => {

        }
    }, [isConnected, address])

    const listNFT = async () => {

    }

    const cancelListing = async () => {

    }

    const buyNFT = async () => {

    }



    return (
        <NFTMarketContext.Provider value={{}}>
            {children}
        </NFTMarketContext.Provider>
    )
}

export default NFTMarketContext