import { useContractNFTProvider } from "@/context/ContractNFTContext";
import { Avatar, Flex, FormControl, Text } from "@chakra-ui/react";
import { AutoComplete, AutoCompleteInput, AutoCompleteItem, AutoCompleteList } from "@choc-ui/chakra-autocomplete";
import { ipfsToHTTPS } from "@/helpers/helper";
import Link from "next/link";

function Search() {
    const { allCollectionsDetails } = useContractNFTProvider()

    return (
        <Flex justify="center" align="center" w="full" direction="column">
            <FormControl w="60">
                <AutoComplete openOnFocus>
                    <AutoCompleteInput placeholder="Rechercher une collection" />
                    {allCollectionsDetails?.length > 0 &&
                        <AutoCompleteList>
                            {allCollectionsDetails.map((collection, index) => (
                                <AutoCompleteItem
                                    key={`option-${index}`}
                                    value={collection.name}
                                    textTransform="capitalize"
                                    align="center"
                                >
                                    <Link href={`/collection/${collection.address}`}>
                                        <Flex direction="row" alignItems="center" wrap="wrap">
                                            <Avatar size="sm" name={collection.name} src={ipfsToHTTPS(collection.image)} />
                                            <Text ml="4">{collection.name}</Text>
                                        </Flex>
                                    </Link>
                                </AutoCompleteItem>
                            ))}
                        </AutoCompleteList>}
                </AutoComplete>
            </FormControl>
        </Flex>
    );
}

export default Search;