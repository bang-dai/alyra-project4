import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Heading, Flex } from '@chakra-ui/react';
import CollectionCard from './CollectionCard';

const AllCollections = () => {
    const { allCollectionsDetails } = useContractNFTProvider()

    return (
        <Flex direction="column" alignItems="center">
            <Heading>Notable Collections</Heading>
            <Flex direction="row" wrap="wrap" alignItems="center" justifyContent="center">
                {allCollectionsDetails && allCollectionsDetails.map((collection, index) =>
                    <CollectionCard key={index} collection={collection} />
                )}

            </Flex>
        </Flex>
    );
};

export default AllCollections;