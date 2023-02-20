import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Heading, Flex } from '@chakra-ui/react';
import Link from 'next/link';
import CollectionCard from './CollectionCard';

const AllCollections = () => {
    const { allCollectionsDetails } = useContractNFTProvider()

    return (
        <Flex direction="row" wrap="wrap" alignItems="center" justifyContent="center">
            {allCollectionsDetails && allCollectionsDetails.map((collection, index) =>
                <Link href={`/collection/${collection.address}`} key={index}>
                    <CollectionCard collection={collection} />
                </Link>
            )}

        </Flex>
    );
};

export default AllCollections;