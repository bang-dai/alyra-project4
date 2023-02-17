import { Card, CardHeader, CardBody, CardFooter, SimpleGrid, Heading, Button, Text } from '@chakra-ui/react'
import Layout from '@/components/layout/Layout';
import NFTList from '@/components/nft/NFTList';

export default function MyNFTs() {
    return (
        <Layout>
            <NFTList />
        </Layout>
    )
}
