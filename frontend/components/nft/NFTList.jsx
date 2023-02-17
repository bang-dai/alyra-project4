import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Flex } from '@chakra-ui/react'
import NFTCard from './NFTCard';

const NFTList = () => {
    const { myNFTs } = useContractNFTProvider()

    return (
        <Flex direction="row" wrap="wrap" alignItems="center">
            {myNFTs.length > 0 &&
                myNFTs.map((nft, index) => <NFTCard key={index} nft={nft} />)
            }
        </Flex>
    );

}
export default NFTList;