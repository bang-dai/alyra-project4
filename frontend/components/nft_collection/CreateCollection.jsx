import { Input, Text, Textarea, Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Flex, useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';

const CreateCollection = () => {
    const inputName = useRef(null)
    const inputSymbol = useRef(null)
    const inputDesc = useRef(null)
    const toast = useToast()
    const [isLoading, setLoading] = useState(false)

    const handleCreate = async () => {
        const name = inputName.current.value
        const symbol = inputSymbol.current.value
        const desc = inputDesc.current.value
        setLoading(true)

        try {
            //SC MarketPlace
            //await deploy(name, symbol, Contract.addr)
            toast({
                description: "Collection NFT créee avec succès.",
                status: 'success',
                isClosable: true,
            })
            inputName.current.value = null
            inputDesc.current.value = null
        }
        catch (e) {
            toast({
                description: e.error?.data?.message ?? "Une erreur inconnu s'est produite!",
                status: 'error',
                isClosable: true,
            })
        }

        setLoading(false)
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
                    src='https://picsum.photos/id/20/300/300'
                    alt='créer une collection de NFT'
                />

                <Stack>
                    <CardHeader><Heading size='md'>Créer une nouvelle collection de NFT</Heading></CardHeader>
                    <CardBody>
                        <Input placeholder='Nom*: Bored Ape Yacht Club' ref={inputName} />
                        <Input placeholder='Symbol*: BAYC' ref={inputSymbol} />
                        <Textarea placeholder='Description' ref={inputDesc} />
                    </CardBody>
                    <CardFooter>
                        <Button variant='solid' colorScheme='blue' onClick={handleCreate} isLoading={isLoading}>
                            Créer
                        </Button>
                    </CardFooter>
                </Stack>
            </Card>
        </Flex>
    );
};

export default CreateCollection;