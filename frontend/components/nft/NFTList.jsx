import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Card, CardHeader, CardBody, CardFooter, SimpleGrid, Heading, Button, Text, Flex } from '@chakra-ui/react'
import NFTCard from './NFTCard';

const NFTList = () => {
    const { myURIs } = useContractNFTProvider()

    return (
        <Flex direction="row" wrap="wrap" alignItems="center">
            {myURIs.length > 0 &&
                myURIs.map((uri, index) => <NFTCard key={index} uri={uri} />)
            }
        </Flex>
    );

}
export default NFTList;