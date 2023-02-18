import {
    Avatar,
    Flex,
    FormControl,
    Text,
} from "@chakra-ui/react";
import {
    AutoComplete,
    AutoCompleteInput,
    AutoCompleteItem,
    AutoCompleteList,
} from "@choc-ui/chakra-autocomplete";

function Search() {
    const people = [
        { name: "Dan Abramov", image: "https://bit.ly/dan-abramov" },
        { name: "Kent Dodds", image: "https://bit.ly/kent-c-dodds" },
        { name: "Segun Adebayo", image: "https://bit.ly/sage-adebayo" },
        { name: "Prosper Otemuyiwa", image: "https://bit.ly/prosper-baba" },
        { name: "Ryan Florence", image: "https://bit.ly/ryan-florence" },
    ];

    return (
        <Flex justify="center" align="center" w="full" direction="column">
            <FormControl w="60">
                <AutoComplete openOnFocus>
                    <AutoCompleteInput placeholder="Recherche une collection" />
                    <AutoCompleteList>
                        {people.map((person, oid) => (
                            <AutoCompleteItem
                                key={`option-${oid}`}
                                value={person.name}
                                textTransform="capitalize"
                                align="center"
                            >
                                <Avatar size="sm" name={person.name} src={person.image} />
                                <Text ml="4">{person.name}</Text>
                            </AutoCompleteItem>
                        ))}
                    </AutoCompleteList>
                </AutoComplete>
            </FormControl>
        </Flex>
    );
}

export default Search;