import { Input, Text, Textarea, Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Flex, useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';

const CreateNFT = () => {
    const toast = useToast()
    const [isLoading, setLoading] = useState(false)
    const [file, setFile] = useState("https://via.placeholder.com/150")
    const inputName = useRef(null)

    const handleCreate = async () => {
        console.log(inputName.current.value)
        setLoading(true)
        try {
            //await addProposal(id)
            toast({
                description: "NFT créee avec succès.",
                status: 'success',
                isClosable: true,
            })
            URL.revokeObjectURL(file)
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

    const handleChange = (e) => {
        console.log(e.target.files[0])
        setFile(URL.createObjectURL(e.target.files[0]))
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
                    maxW={{ base: '100%', sm: '200px' }}
                    src={file}
                    alt='Caffe Latte'
                />

                <Stack>
                    <CardHeader><Heading size='md'>Créer votre NFT</Heading></CardHeader>
                    <CardBody>
                        <Input placeholder='Nom' ref={inputName} />
                        <Input placeholder='Image du NFT' type="file" onChange={handleChange} />
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

export default CreateNFT;