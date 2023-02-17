import { ipfsToHTTPS } from '@/helpers/helper';
import { Card, CardBody, CardFooter, Divider, Button, Image, Text, Stack } from '@chakra-ui/react'
import { useEffect, useState } from 'react';

const NFTCard = ({ uri }) => {
    const [meta, setMeta] = useState()

    useEffect(() => {
        const fetchMetadata = async () => {
            const metadataResponse = await fetch(ipfsToHTTPS(uri));
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
        <Card width="200px" m="1rem" height="400px">
            <CardBody p="0">
                <Image
                    objectFit='cover'
                    src={meta?.imageURL}
                    alt={meta?.name}
                    borderRadius='lg'
                    fallbackSrc='https://via.placeholder.com/200'
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