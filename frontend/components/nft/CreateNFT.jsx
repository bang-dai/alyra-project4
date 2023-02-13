import { Input, Text, Textarea, Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Flex, useToast } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { NFTStorage, File } from 'nft.storage'


const CreateNFT = () => {
    const preview = "https://via.placeholder.com/300"
    const toast = useToast()
    const [isLoading, setLoading] = useState(false)
    const [file, setFile] = useState(preview)
    const [image, setImage] = useState(null)
    const inputName = useRef(null)
    const inputDesc = useRef(null)
    const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    const storeNFT = async () => {
        const metadata = await nftstorage.store({
            image: image,
            name: inputName.current.value.trim(),
            description: inputDesc.current.value.trim(),
        })

        return metadata
    }

    const handleCreate = async () => {
        const name = inputName.current.value
        if (name == null || name.trim().length == 0 || file == preview) {
            toast({
                description: "Le nom et l'image du NFT sont obligatoire!",
                status: 'error',
                isClosable: true,
            })
            return
        }
        setLoading(true)
        try {
            //metadata.url contain the ipfs metadata.json
            const metatada = await storeNFT().catch(err => {
                console.error(err)
                process.exit(1)
            })
            //await call SC here
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
                    alt='Preview NFT'
                />
                <Stack>
                    <CardHeader><Heading size='md'>Créer votre NFT</Heading></CardHeader>
                    <CardBody>
                        <Input placeholder='Nom*' ref={inputName} />
                        <Textarea placeholder='Description' ref={inputDesc} />
                        <Input placeholder='Image* du NFT' type="file" onChange={handleChange} />
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