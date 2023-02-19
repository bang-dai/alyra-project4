import { Card, CardBody } from "@chakra-ui/card";
import { Image } from "@chakra-ui/image";
import { Stack, Text } from "@chakra-ui/layout";
import { ipfsToHTTPS } from "@/helpers/helper";
import Link from "next/link";

const CollectionCard = ({ collection }) => {
    return (
        <Link href={`/collection/${collection.address}`} >
            <Card width="300" m="1rem">
                <CardBody p="0">
                    <Image
                        objectFit='cover'
                        src={ipfsToHTTPS(collection?.image)}
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
    );
};

export default CollectionCard;