import { ipfsToHTTPS } from '@/helpers/helper';
import { Card, CardHeader, CardBody, CardFooter, SimpleGrid, Stack, Heading, Divider, ButtonGroup, Button, Image, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react';

const NFTCard = (nft) => {
    const [meta, setMeta] = useState()

    useEffect(() => {
        const fetchMetadata = async () => {
            const metadataResponse = await fetch(ipfsToHTTPS(nft.uri));
            if (metadataResponse.status != 200) return;
            const json = await metadataResponse.json();
            setMeta({
                name: json.name,
                description: json.description,
                imageURL: ipfsToHTTPS(json.image),
            });
        };
        fetchMetadata();
    }, []);

    return (
        <Card width="200px" height="400px" m="1rem">
            <CardBody p="0">
                <Image height="250" width="100%"
                    src={meta?.imageURL}
                    alt={meta?.name}
                    borderRadius='lg'
                />
                <Stack p='6' spacing='3'>
                    <Text>{meta?.name}</Text>
                    <Text>{meta?.description}</Text>
                </Stack>
            </CardBody>
            <Divider />
            <CardFooter p="0">
                <Button variant='solid' width="100%">
                    Buy now
                </Button>
            </CardFooter>
        </Card>
    );
};

export default NFTCard;