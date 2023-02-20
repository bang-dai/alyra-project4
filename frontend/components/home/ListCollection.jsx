import { useContractNFTProvider } from '@/context/ContractNFTContext';
import {
    Flex, Image, Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
    Divider,
    Select,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import NFTCard from '../nft/NFTCard';
import { ipfsToHTTPS } from '@/helpers/helper';

const ListCollection = ({ addr }) => {
    const { isConnected, GetNFTsFromCollection, getCollectionDetails } = useContractNFTProvider()
    const [collection, setCollection] = useState(null)
    const [NFTs, setNFTs] = useState([])

    useEffect(() => {
        const getOneCollectionDetails = async (NFTCollectionAddr) => {
            const collectionDetail = await getCollectionDetails(NFTCollectionAddr)
            setCollection(collectionDetail)
        }

        const getNFTs = async () => {
            //retrieve NFTs from this collection
            const asyncNFTs = await GetNFTsFromCollection(addr)
            setNFTs(asyncNFTs)
        }

        //get collection informations
        getOneCollectionDetails(addr)
        //get NFTs for this collection
        getNFTs(addr)

        return () => {
            setCollection(null)
        }
    }, [addr]);

    const orderNFTs = async (order = "up") => {

        const copyNFTs = [...NFTs]
        const listed = copyNFTs.filter(item => item.price > 0)
        const notListed = copyNFTs.filter(item => item.price.isZero())
        listed.sort((a, b) => {
            if (a.price.eq(b.price)) {
                return 0
            }
            if (order == "up") {
                return a.price < b.price ? -1 : 1
            }
            if (order == "down") {
                return a.price > b.price ? -1 : 1
            }
        })

        setNFTs([...listed, ...notListed])
    }


    const handleChange = (e) => {
        const order = e.target.value
        orderNFTs(order)
    }

    return (
        <Flex direction="column">
            <Flex direction="row">
                <Image src={collection?.image ? ipfsToHTTPS(collection.image) : ""} fallbackSrc='https://via.placeholder.com/600x200' height="200px" />
                <TableContainer>
                    <Table size='sm'>
                        <Tbody>
                            <Tr>
                                <Td>Nom</Td>
                                <Td>{collection?.name}</Td>
                            </Tr>
                            <Tr>
                                <Td>Description</Td>
                                <Td>{collection?.description}</Td>
                            </Tr>
                            <Tr>
                                <Td>Contrat</Td>
                                <Td>{collection?.address}</Td>
                            </Tr>
                        </Tbody>
                    </Table>
                </TableContainer>
            </Flex>
            <Flex direction="row" alignItems="center" ml="auto">
                <Select placeholder='Trier' width="200px" onChange={handleChange}>
                    <option value='up'>Prix croissant</option>
                    <option value='down'>Prix décroissant</option>
                </Select>
            </Flex>
            <Divider mt="1rem" mb="1rem" />
            <Flex direction="row" wrap="wrap" alignItems="center">
                {NFTs.length > 0 &&
                    NFTs.map((nft, index) => <NFTCard key={index} nft={nft} />)
                }
            </Flex>
        </Flex>
    );
};

export default ListCollection;