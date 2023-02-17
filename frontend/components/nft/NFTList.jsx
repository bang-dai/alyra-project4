import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Card, CardHeader, CardBody, CardFooter, SimpleGrid, Heading, Button, Text, Flex } from '@chakra-ui/react'
import NFTCard from './NFTCard';

const NFTList = () => {
    const { myTokenURIs } = useContractNFTProvider()

    return (
        <Flex direction="row" wrap="wrap" alignItems="center">
            {myTokenURIs.length > 0 &&
                myTokenURIs.map((uri, index) => <NFTCard key={index} uri={uri} />)
            }
        </Flex>
    );

}
export default NFTList;