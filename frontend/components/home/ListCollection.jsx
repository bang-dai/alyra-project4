import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Flex } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import NFTCard from '../nft/NFTCard';

const ListCollection = ({ addr }) => {
    const { GetNFTsFromCollection, allNFTs } = useContractNFTProvider()

    useEffect(() => {
        GetNFTsFromCollection(addr)
    }, []);
    return (
        <Flex direction="column">
            <Flex direction="row" wrap="wrap" alignItems="center">
                {allNFTs.length > 0 &&
                    allNFTs.map((nft, index) => <NFTCard key={index} nft={nft} />)
                }
            </Flex>
        </Flex>
    );
};

export default ListCollection;