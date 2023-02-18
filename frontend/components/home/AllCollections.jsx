import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Input, Text, Textarea, Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Flex, useToast, SimpleGrid, Divider, Center } from '@chakra-ui/react';
import Link from 'next/link';

const AllCollections = () => {
    const { allCollectionsDetails } = useContractNFTProvider()

    return (
        <Flex direction="column" alignItems="center">
            <Heading>Notable Collections</Heading>
            <Flex direction="row" wrap="wrap" alignItems="center" justifyContent="center">
                {allCollectionsDetails && allCollectionsDetails.map((collection, index) =>
                    <Link key={index} href="#" >
                        <Card width="300" m="1rem">
                            <CardBody p="0">
                                <Image
                                    objectFit='cover'
                                    src={collection?.image}
                                    alt={collection?.name}
                                    borderRadius='lg'
                                    fallbackSrc='https://via.placeholder.com/300x200'
                                />
                                <Stack p='6' spacing='3'>
                                    <Text>{collection?.name}</Text>
                                    <Text>{collection?.description}</Text>
                                </Stack>
                            </CardBody>
                        </Card>
                    </Link>
                )}

            </Flex>
        </Flex>
    );
};

export default AllCollections;