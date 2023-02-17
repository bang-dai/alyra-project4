import { ipfsToHTTPS } from '@/helpers/helper';
import { Card, CardBody, CardFooter, Divider, Button, Image, Text, Stack, Flex, Badge } from '@chakra-ui/react'
import { useEffect, useState } from 'react';

const NFTCard = ({ nft }) => {
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

    const handleSale = () => {
    }

    const handleCancelListing = () => {
    }

    const handleMouseOver = (e) => {
        e.currentTarget.innerText = "Annuler"
    }

    const handleMouseOut = (e) => {
        e.currentTarget.innerText = nft.price + " ETH"
    }

    return (
        <Card width="200px" m="1rem">
            <CardBody p="0">
                <Image
                    objectFit='cover'
                    src={meta?.imageURL}
                    alt={meta?.name}
                    borderRadius='lg'
                    fallbackSrc='https://via.placeholder.com/200'
                />
                <Stack p='2'>
                    <Badge variant='outline' colorScheme='green'>{nft.collection.name}</Badge>
                    <Text>{meta?.name}</Text>
                </Stack>
            </CardBody>
            <CardFooter p="0">
                {nft.price == 0 ?
                    <Button width="100%" onClick={handleSale}>Vendre</Button>
                    : <Button width="100%"
                        onClick={handleCancelListing}
                        onMouseOver={(e) => handleMouseOver(e)}
                        onMouseOut={(e) => handleMouseOut(e)}
                    >{nft.price} ETH</Button>
                }
            </CardFooter>
        </Card>
    );
};

export default NFTCard;