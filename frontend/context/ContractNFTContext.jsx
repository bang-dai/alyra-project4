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
    const [myCollections, setMyCollections] = useState([])
    const [allCollections, setAllCollections] = useState([])
    const [myURIs, setMyURIs] = useState([])
    const [myCollectionsDetails, setMyCollectionsDetails] = useState([])

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
            setAllCollections([])
            setMyCollectionsDetails([])
        }
    }, [isConnected, address])


    //update all collections addr
    const updateCollections = async () => {
        await getMyCollections()
        await getNFTCollections()
    }

    //create new collection. attention: signer is not the msg.sender, that's why I use address in param
    const deploy = async (name, symbol, desc) => {
        const tx = await contract.deploy(name, symbol, desc, address, marketplaceAddr)
        await tx.wait()
        await updateCollections()
    }

    //get detail about collections
    const getDetail = async (collections) => {
        const asyncCollections = await Promise.all(collections.map(async (addr) => {
            const c_NFTCollection = new ethers.Contract(addr, ContractCollection.abi, provider)
            return {
                "name": await c_NFTCollection.connect(address).name(),
                "symbol": await c_NFTCollection.connect(address).symbol(),
                "description": await c_NFTCollection.connect(address).getDescription(),
                "address": addr
            }
        }))

        setMyCollectionsDetails(asyncCollections)
    }

    //get my created collection addr
    const getMyCollections = async () => {
        const collections = await contractRead.connect(address).getMyCollections()
        setMyCollections(collections)
        getDetail(collections)
    }

    //get all created collection addr
    const getNFTCollections = async () => {
        const collections = await contractRead.connect(address).getNFTCollections()
        setAllCollections(collections)
        getMyNFTs(collections)
    }

    //create a new NFT with URI for a giver collection in param
    const createNFT = async (NFTCollectionAddr, uri) => {
        const c_NFTCollection = new ethers.Contract(NFTCollectionAddr, ContractCollection.abi, signer)
        const tx = await c_NFTCollection.createNFT(uri)
        await tx.wait()
    }

    const getMyNFTs = async (allCollections) => {
        const asyncURIs = await Promise.all(allCollections.map(async (addr) => {
            const c_NFTCollection = new ethers.Contract(addr, ContractCollection.abi, provider)
            const tokenIds = await c_NFTCollection.tokensOfOwner(address)
            tokenIds.map(async (tokenId) => {
                const uri = await c_NFTCollection.tokenURI(tokenId)
                setMyURIs(URI => [...URI, uri])
            })
        }))
    }

    return (
        <ContractNFTContext.Provider value={{ contractAddress, Contract, address, isConnected, deploy, myCollections, myCollectionsDetails, createNFT, myURIs }}>
            {children}
        </ContractNFTContext.Provider>
    )
}

export default ContractNFTContext