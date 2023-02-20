import { useContractNFTProvider } from '@/context/ContractNFTContext';
import {
    Flex, Image, Table,
    Tbody,
    Tr,
    Td,
    TableContainer,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import NFTCard from '../nft/NFTCard';
import { ipfsToHTTPS } from '@/helpers/helper';

const ListCollection = ({ addr }) => {
    const { GetNFTsFromCollection, allNFTs, getCollectionDetails } = useContractNFTProvider()
    const [collection, setCollection] = useState(null)



    useEffect(() => {
        const getOneCollectionDetails = async (NFTCollectionAddr) => {
            const collectionDetail = await getCollectionDetails(NFTCollectionAddr)
            setCollection(collectionDetail)
        }
        //retrieve NFTs from this collection
        GetNFTsFromCollection(addr)
        //get collection informations
        getOneCollectionDetails(addr)

        return () => {
            setCollection(null)
        }
    }, [addr]);
    return (
        <Flex direction="column">
            <Flex direction="row">
                <Image src={collection?.image ? ipfsToHTTPS(collection.image) : ""} fallbackSrc='https://via.placeholder.com/1280x200' height="200px" />
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
            <Flex direction="row" wrap="wrap" alignItems="center">
                {allNFTs.length > 0 &&
                    allNFTs.map((nft, index) => <NFTCard key={index} nft={nft} />)
                }
            </Flex>
        </Flex>
    );
};

export default ListCollection;