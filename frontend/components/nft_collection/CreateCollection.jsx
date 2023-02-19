import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { Input, Text, Textarea, Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Flex, useToast, SimpleGrid, Divider, Badge } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { storeNFT } from '@/helpers/helper';

const CreateCollection = () => {
    const preview = "https://via.placeholder.com/300"
    const inputName = useRef(null)
    const inputSymbol = useRef(null)
    const inputDesc = useRef(null)
    const inputImage = useRef(null)
    const toast = useToast()
    const [isLoading, setLoading] = useState(false)
    const [file, setFile] = useState(preview)
    const [image, setImage] = useState(null)
    const { createNFTCollection, myCollectionsDetails } = useContractNFTProvider()

    const handleCreate = async () => {
        const name = inputName.current.value
        const symbol = inputSymbol.current.value
        const desc = inputDesc.current.value
        if (name == null || name.trim().length == 0 || symbol == null || symbol.trim().length == 0 || file == preview) {
            toast({
                description: "Le nom, le symbol et l'image sont obligatoire!",
                status: 'error',
                isClosable: true,
            })
            return
        }

        setLoading(true)
        try {
            const metadata = await storeNFT(image, name, desc)
            const imageURL = metadata.data.image.href

            await createNFTCollection(name, symbol, desc, imageURL)
            toast({
                description: "Collection NFT créee avec succès.",
                status: 'success',
                isClosable: true,
            })
            inputName.current.value = null
            inputSymbol.current.value = null
            inputDesc.current.value = null
            inputImage.current.value = null
            URL.revokeObjectURL(file)
            setFile(preview)
        }
        catch (e) {
            toast({
                description: e.reason ?? "Une erreur inconnu s'est produite!",
                status: 'error',
                isClosable: true,
            })
        }

        setLoading(false)
    }

    const handleChange = (e) => {
        setFile(URL.createObjectURL(e.target.files[0]))
        setImage(e.target.files[0])
    }

    return (
        <Flex direction="column">
            <Card
                direction={{ base: 'column', sm: 'row' }}
                overflow='hidden'
                variant='outline'
            >
                <Image
                    objectFit='cover'
                    maxW={{ base: '100%', sm: '300px' }}
                    src={file}
                    alt='créer une collection de NFT'
                />

                <Stack>
                    <CardHeader><Heading size='md'>Créer une nouvelle collection de NFT</Heading></CardHeader>
                    <CardBody>
                        <Input placeholder='Nom*: Bored Ape Yacht Club' ref={inputName} />
                        <Input placeholder='Symbol*: BAYC' ref={inputSymbol} />
                        <Textarea placeholder='Description' ref={inputDesc} />
                        <Input placeholder='Image* de la collection' type="file" onChange={handleChange} ref={inputImage} />
                    </CardBody>
                    <CardFooter>
                        <Button variant='solid' colorScheme='blue' onClick={handleCreate} isLoading={isLoading}>
                            Créer
                        </Button>
                    </CardFooter>
                </Stack>
            </Card>
            <Divider orientation='horizontal' mt="1rem" mb="1rem" />
            <SimpleGrid spacing={4} templateColumns='repeat(auto-fill, minmax(200px, 1fr))'>
                {myCollectionsDetails && myCollectionsDetails.map((collection, index) =>
                    <Card key={index}>
                        <CardHeader>
                            <Heading size='md'>{collection.name}</Heading>
                            <Badge variant='outline' colorScheme='green'>{collection.symbol}</Badge>
                        </CardHeader>
                        <CardBody>
                            <Text>{collection.description}</Text>
                        </CardBody>
                        <CardFooter>
                            <Button>Gérer la collection</Button>
                        </CardFooter>
                    </Card>
                )}
            </SimpleGrid>
        </Flex>
    );
};

export default CreateCollection;