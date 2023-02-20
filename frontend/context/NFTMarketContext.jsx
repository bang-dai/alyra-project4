import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Contract from '../../backend/artifacts/contracts/NFTMarketPlace.sol/NFTMarketPlace.json' //update here
import ContractCollection from '../../backend/artifacts/contracts/NFTCollection.sol/NFTCollection.json' //update here
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

    //1) List my NFTs
    const listNFT = async (tokenId, nftCollection, priceWei) => {
        //need approve before listing
        const c_NFTCollection = new ethers.Contract(nftCollection, ContractCollection.abi, signer)
        const isApproved = await c_NFTCollection.isApprovedForAll(address, marketplaceAddr)
        if (!isApproved) {
            const approve = await c_NFTCollection.setApprovalForAll(marketplaceAddr, true)
            await approve.wait()
        }

        const tx = await contract.listNFT(tokenId, priceWei, nftCollection)
        await tx.wait()
    }

    //2) Cancel my NFT
    const cancelListing = async (tokenId, nftCollection) => {
        const tx = await contract.cancelListing(tokenId, nftCollection)
        await tx.wait()
    }

    //3) Buy one NFT
    const buyNFT = async (tokenId, NFTCollectionAddr, priceWei) => {
        const transaction = await contract.buyNFT(tokenId, NFTCollectionAddr, { value: priceWei })
        await transaction.wait()
    }

    //Get listing price of a NFT
    const getPrice = async (tokenId, collectionAddr) => {
        const listing = await contractRead.connect(address).getListings(collectionAddr, tokenId)
        return listing.price //BigNumber
    }

    return (
        <NFTMarketContext.Provider value={{ listNFT, cancelListing, getPrice, buyNFT }}>
            {children}
        </NFTMarketContext.Provider>
    )
}

export default NFTMarketContext