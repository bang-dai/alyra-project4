import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Contract from '../../backend/artifacts/contracts/NFTCollectionFactory.sol/NFTCollectionFactory.json' //update here
import ContractCollection from '../../backend/artifacts/contracts/NFTCollection.sol/NFTCollection.json' //update here
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
    //addresses of my collections NFT
    const [myCollections, setMyCollections] = useState([])
    //addresses of all collections NFT
    const [allCollections, setAllCollections] = useState([])
    //my collections NFT with details
    const [myCollectionsDetails, setMyCollectionsDetails] = useState([])
    //all collections NFT with details
    const [allCollectionsDetails, setAllCollectionsDetails] = useState([])
    //my token URIs list
    const [myNFTs, setMyNFTs] = useState([])

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
            updateCollections()
        }

        return () => {
            setMyCollections([])
            setMyCollectionsDetails([])
            setAllCollectionsDetails([])
            setMyNFTs([])
        }
    }, [isConnected, address])


    //update all collections addr
    const updateCollections = async () => {
        await getMyCollections()
        await getNFTCollections()
    }

    //create new collection. attention: signer is not the msg.sender, that's why I use address in param
    const createNFTCollection = async (name, symbol, desc) => {
        const tx = await contract.deploy(name, symbol, desc, address, marketplaceAddr)
        await tx.wait()
        await updateCollections()
    }

    //parse and get detail about collections
    const parseNFTCollections = async (collections) => {
        const asyncCollections = await Promise.all(collections.map(async (addr) => {
            const c_NFTCollection = new ethers.Contract(addr, ContractCollection.abi, provider)
            return {
                "name": await c_NFTCollection.connect(address).name(),
                "symbol": await c_NFTCollection.connect(address).symbol(),
                "description": await c_NFTCollection.connect(address).getDescription(),
                "address": addr
            }
        }))

        return asyncCollections
    }

    //get my created collection addr
    const getMyCollections = async () => {
        const collections = await contractRead.connect(address).getMyCollections()
        setMyCollections(collections)
        //add collection details
        const parsedNFTCollections = await parseNFTCollections(collections)
        setMyCollectionsDetails(parsedNFTCollections)
    }

    //get all created collection addr
    const getNFTCollections = async () => {
        const allCollectionsAddr = await contractRead.connect(address).getNFTCollections()
        //setAllCollections(collections)
        //add collection details
        const parsedAllCollections = await parseNFTCollections(allCollectionsAddr)
        setAllCollectionsDetails(parsedAllCollections)
        //get my NFTs depends on all collections
        getMyNFTs(parsedAllCollections)
    }

    //create a new NFT with URI for a giver collection in param
    const createNFT = async (NFTCollectionAddr, uri) => {
        const c_NFTCollection = new ethers.Contract(NFTCollectionAddr, ContractCollection.abi, signer)
        const tx = await c_NFTCollection.createNFT(uri)
        const receipt = await tx.wait()
        return receipt.events[0].args.tokenId
    }

    //for all collections, set my tokenIds => show my NFTs in NFTCard
    const getMyNFTs = async (parsedAllCollections) => {
        const asyncURIs = await Promise.all(parsedAllCollections.map(async (NFTCollection) => {
            const c_NFTCollection = new ethers.Contract(NFTCollection.address, ContractCollection.abi, provider)
            const tokenIds = await c_NFTCollection.tokensOfOwner(address)
            //init tokenIds, avoid duplicate
            setMyNFTs([])
            tokenIds.map(async (tokenId) => {
                const nft = {
                    "owner": address,
                    "price": 0,
                    "tokenId": tokenId,
                    "uri": await c_NFTCollection.tokenURI(tokenId),
                    "collection": NFTCollection

                }
                setMyNFTs(NFTs => [...NFTs, nft])
            })
        }))
    }

    const updateMyNFTs = (tokenId, NFTCollectionAddr, uri) => {
        const index = myCollectionsDetails.findIndex(collection => collection.address == NFTCollectionAddr)
        const nft = {
            "owner": address,
            "price": 0,
            "tokenId": tokenId,
            "uri": uri,
            "collection": myCollectionsDetails[index]
        }
        setMyNFTs(NFTs => [...NFTs, nft])
    }

    return (
        <ContractNFTContext.Provider value={{
            contractAddress, Contract, address, isConnected,
            createNFTCollection, createNFT, updateMyNFTs,
            myCollections, myCollectionsDetails, allCollectionsDetails, myNFTs
        }}>
            {children}
        </ContractNFTContext.Provider>
    )
}

export default ContractNFTContext