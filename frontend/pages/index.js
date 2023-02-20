import AllCollections from '@/components/home/AllCollections';
import Layout from '@/components/layout/Layout';
import { Heading } from '@chakra-ui/react';

export default function Home() {

  return (
    <Layout title="Meilleures collections">
      <AllCollections />
    </Layout>
  )
}
