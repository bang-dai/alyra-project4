import { EmailIcon } from "@chakra-ui/icons";
import { Button, FormControl, FormLabel, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, IconButton, useToast } from "@chakra-ui/react";
import { useRef } from "react";
import { ethers } from "ethers";
import { useContractNFTProvider } from "@/context/ContractNFTContext";
import { useNFTMarketProvider } from "@/context/NFTMarketContext";

const NFTTransferModal = ({ meta, nft }) => {
    const { address, updateMyNFTs } = useContractNFTProvider()
    const { transferNFT } = useNFTMarketProvider()
    const { isOpen, onOpen, onClose } = useDisclosure();
    const inputAddr = useRef(null)
    const toast = useToast()

    const transfer = async () => {
        const to = inputAddr.current.value
        const isAddr = ethers.utils.isAddress(to)
        if (!isAddr) {
            toast({
                description: "Votre addresse est invalide",
                status: 'error',
                isClosable: true,
            })
            return
        }

        if (address == to) {
            toast({
                description: "Vous ne pouvez pas vous envoyer votre NFT",
                status: 'error',
                isClosable: true,
            })
            return
        }

        try {
            await transferNFT(nft.tokenId, nft.collection.address, to)
            toast({
                description: "NFT transféré avec succès.",
                status: 'success',
                isClosable: true,
            })

            //synchronize my NFTs
            await updateMyNFTs()
        }
        catch (e) {
            console.log(e)
            toast({
                description: e.reason ?? "Une erreur inconnu s'est produite!",
                status: 'error',
                isClosable: true,
            })
        }
    }
    return (
        <>
            <IconButton
                size="xs"
                onClick={onOpen}
                variant='outline'
                colorScheme='teal'
                aria-label='Send email'
                icon={<EmailIcon />}
            />
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Transférer : {meta?.name}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>Addresse ETH</FormLabel>
                            <Input ref={inputAddr} placeholder='0x0...' />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={transfer}>
                            Confirmer
                        </Button>
                        <Button onClick={onClose}>Annuler</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default NFTTransferModal;