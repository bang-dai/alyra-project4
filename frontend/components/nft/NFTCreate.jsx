import { Input, Select, Textarea, Card, CardHeader, CardBody, CardFooter, Stack, Heading, Button, Image, Flex, useToast, Alert, AlertIcon } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { NFTStorage } from 'nft.storage'
import { useContractNFTProvider } from '@/context/ContractNFTContext';
import Link from 'next/link';


const NFTCreate = () => {
    const preview = "https://via.placeholder.com/300"
    const toast = useToast()
    const [isLoading, setLoading] = useState(false)
    const [file, setFile] = useState(preview)
    const [image, setImage] = useState(null)
    const inputName = useRef(null)
    const inputDesc = useRef(null)
    const inputImage = useRef(null)
    const selectCollection = useRef(null)
    const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })
    const { myCollections, myCollectionsDetails, createNFT, updateMyNFTs } = useContractNFTProvider()


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
        const NFTCollectionAddr = selectCollection.current.value
        if (NFTCollectionAddr == null || NFTCollectionAddr.trim().length == 0) {
            toast({
                description: "Veillez choisir une collection de NFT!",
                status: 'error',
                isClosable: true,
            })
            return
        }
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
            //call nft.storage API and stock image on ipfs
            const metadata = await storeNFT().catch(err => {
                console.error(err)
                process.exit(1)
            })
            //call SC with collection addr and uri
            const tokenId = await createNFT(NFTCollectionAddr, metadata.url)
            toast({
                description: "NFT créee avec succès.",
                status: 'success',
                isClosable: true,
            })
            //synchronize my NFTs
            await updateMyNFTs(tokenId, NFTCollectionAddr, metadata.url)
            //reset values
            selectCollection.current.value = null
            inputName.current.value = null
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
            {myCollections.length > 0 ? (
                <>
                    <Select placeholder='Choisissez une collection de NFT' ref={selectCollection}>
                        {myCollectionsDetails && myCollectionsDetails.map((collection, index) =>
                            <option key={index} value={collection.address}>{collection.name}</option>
                        )}

                    </Select>
                    < Card
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
                                <Input placeholder='Image* du NFT' type="file" onChange={handleChange} ref={inputImage} />
                            </CardBody>
                            <CardFooter>
                                <Button colorScheme='blue' onClick={handleCreate} isLoading={isLoading}>
                                    Créer
                                </Button>
                            </CardFooter>
                        </Stack>
                    </Card></>) : (<Flex direction="column">
                        <Alert status='warning' m="1rem">
                            <AlertIcon />
                            Vous n'avez pas encore de collection. Veuillez en créer une avant.
                        </Alert>
                        <Link href="collections"><Button m="1rem" colorScheme='blue'>Créer une collection.</Button></Link>
                    </Flex>)}
        </Flex >
    );
};

export default NFTCreate;