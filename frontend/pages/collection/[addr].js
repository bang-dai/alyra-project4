import ListCollection from '@/components/home/ListCollection';
import Layout from '@/components/layout/Layout';

import { useRouter } from 'next/router'

const Collection = () => {
    const router = useRouter()
    const { addr } = router.query

    return (
        <Layout>
            <ListCollection addr={addr} />
        </Layout>
    );
};

export default Collection;