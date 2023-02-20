import { Card, CardBody } from "@chakra-ui/card";
import { Image } from "@chakra-ui/image";
import { Badge } from '@chakra-ui/react'
import { Stack, Text } from "@chakra-ui/layout";
import { ipfsToHTTPS } from "@/helpers/helper";
import Link from "next/link";

const CollectionCard = ({ collection }) => {
    return (
        <Card width="300" m="1rem">
            <CardBody p="0">
                <Image
                    boxSize="300px"
                    objectFit='cover'
                    src={ipfsToHTTPS(collection?.image)}
                    alt={collection?.name}
                    borderRadius='lg'
                    fallbackSrc='https://via.placeholder.com/300x200'
                />
                <Stack p='6' spacing='3'>
                    <Badge variant='outline' colorScheme='green' textAlign="center">{collection.name}</Badge>
                </Stack>
            </CardBody>
        </Card>
    );
};

export default CollectionCard;