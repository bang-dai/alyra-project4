import Layout from '@/components/layout/Layout';
import CreateNFT from '@/components/nft/CreateNFT';
import { Button } from '@chakra-ui/react';

export default function Home() {

    return (
        <Layout>
            <CreateNFT />
        </Layout>
    )
}
