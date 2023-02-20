import { useContractNFTProvider } from '@/context/ContractNFTContext';
import { useNFTMarketProvider } from '@/context/NFTMarketContext';
import { ipfsToHTTPS, minifyAddress } from '@/helpers/helper';
import {
    Card, CardBody, CardFooter, Divider, Button, Image, Text, Stack, Flex, Badge, useDisclosure, Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Input,
    useToast,
} from '@chakra-ui/react'
import { ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import NFTTransferModal from './NFTTransferModal';

const NFTCard = ({ nft }) => {
    const { listNFT, cancelListing, buyNFT } = useNFTMarketProvider()
    const { updateMyNFTs } = useContractNFTProvider()
    const [meta, setMeta] = useState()
    const [isLoading, setLoading] = useState(false)
    const [cancelText, setCancelText] = useState(ethers.utils.formatEther(nft.price) + " ETH")
    const [buyText, setBuyText] = useState(ethers.utils.formatEther(nft.price) + " ETH")
    const { address, isConnected } = useAccount()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const inputPrice = useRef(null)
    const toast = useToast()

    useEffect(() => {
        const fetchMetadata = async () => {
            const metadataResponse = await fetch(ipfsToHTTPS(nft.uri));
            if (metadataResponse.status != 200) return;
            const json = await metadataResponse.json();
            setMeta({
                name: json.name,
                description: json.description,
                imageURL: ipfsToHTTPS(json.image),
            });
        };
        fetchMetadata();
        //resynchronize price button when order items
        setCancelText(ethers.utils.formatEther(nft.price) + " ETH")
        setBuyText(ethers.utils.formatEther(nft.price) + " ETH")

    }, [nft]);

    const handleSale = async () => {
        const price = inputPrice.current.value
        if (price <= 0) {
            toast({
                description: "Veillez choisir un prix positif",
                status: 'error',
                isClosable: true,
            })
            return
        }

        setLoading(true)
        try {
            const priceWei = ethers.utils.parseEther(price)
            await listNFT(nft.tokenId, nft.collection.address, priceWei)
            toast({
                description: "NFT listé avec succès.",
                status: 'success',
                isClosable: true,
            })
            //update my nft price
            nft.price = priceWei
            setCancelText(ethers.utils.formatEther(nft.price) + " ETH")
            setBuyText(ethers.utils.formatEther(nft.price) + " ETH")

            //synchronize my NFTs
            await updateMyNFTs()

            //reset values
            inputPrice.current.value = null
            onClose()
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

    const handleCancelListing = async () => {
        setLoading(true)
        try {
            await cancelListing(nft.tokenId, nft.collection.address)
            toast({
                description: "NFT annulé avec succès.",
                status: 'success',
                isClosable: true,
            })
            //update my card price
            nft.price = ethers.BigNumber.from("0")
            //synchronize my NFTs
            await updateMyNFTs()
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

    const handleBuy = async () => {
        setLoading(true)
        try {
            await buyNFT(nft.tokenId, nft.collection.address, nft.price)
            toast({
                description: "NFT acheté avec succès.",
                status: 'success',
                isClosable: true,
            })
            //update my card price
            nft.price = ethers.BigNumber.from("0")
            nft.owner = address
            //synchronize my NFTs
            await updateMyNFTs()
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

    const displayButton = () => {
        if (nft.owner == address) {
            if (nft.price.eq(ethers.BigNumber.from("0"))) {
                return <Button width="100%" onClick={onOpen} isLoading={isLoading}>Vendre</Button>
            } else {
                return <Button width="100%"
                    isLoading={isLoading}
                    onClick={handleCancelListing}
                    onMouseOver={() => setCancelText("Annuler")}
                    onMouseOut={() => setCancelText(ethers.utils.formatEther(nft.price) + " ETH")}
                >{cancelText}</Button>
            }
        } else {
            if (nft.price.eq(ethers.BigNumber.from("0"))) {
                return <Button width="100%">Pas en vente</Button>
            } else {
                return <Button width="100%"
                    isLoading={isLoading}
                    onClick={handleBuy}
                    onMouseOver={() => setBuyText("Acheter")}
                    onMouseOut={() => setBuyText(ethers.utils.formatEther(nft.price) + " ETH")}
                >{buyText}</Button>
            }
        }
    }

    return (
        <div>
            <Card width="200px" m="1rem">
                <CardBody p="0">
                    <Image
                        boxSize='200px'
                        objectFit='cover'
                        src={meta?.imageURL}
                        alt={meta?.name}
                        borderRadius='lg'
                        fallbackSrc='https://via.placeholder.com/200'
                    />
                    <Stack p='2'>
                        <Badge variant='outline' colorScheme='green'>{nft?.collection?.name}</Badge>
                        <Flex direction="row" justifyContent="space-between">
                            <Text>{meta?.name}</Text>
                            {address == nft.owner && <NFTTransferModal meta={meta} nft={nft} />}
                        </Flex>
                        <Text>{minifyAddress(nft.owner)}</Text>
                    </Stack>
                </CardBody>
                <CardFooter p="0">
                    {displayButton()}
                </CardFooter>
            </Card>
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Vendre : {meta?.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Prix de vente en ETH</FormLabel>
                            <Input type='number' ref={inputPrice} placeholder='1 ETH' />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handleSale}>
                            Confirmer
                        </Button>
                        <Button onClick={onClose}>Annuler</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default NFTCard;