import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { ipfsToHTTPS } from '@/helpers/helper';
import { Input, Text, Textarea, Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Flex, useToast, SimpleGrid, Divider, Center } from '@chakra-ui/react';
import Link from 'next/link';
import CollectionCard from './CollectionCard';

const AllCollections = () => {
    const { allCollectionsDetails } = useContractNFTProvider()

    return (
        <Flex direction="column" alignItems="center">
            <Heading>Notable Collections</Heading>
            <Flex direction="row" wrap="wrap" alignItems="center" justifyContent="center">
                {allCollectionsDetails && allCollectionsDetails.map((collection, index) =>
                    <CollectionCard key={index} collection={collection} />
                )}

            </Flex>
        </Flex>
    );
};

export default AllCollections;