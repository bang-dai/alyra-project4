import { useWcdoProvider } from '@/context/WcdoContext'
import {
    Card, CardHeader, CardBody, CardFooter, Heading, Button, Text,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
} from '@chakra-ui/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRef, useState } from 'react'

const Wcdo = () => {
    const toast = useToast()
    const inputNumber = useRef(null)
    const [isLoading, setLoading] = useState(false)
    const { minted, totalSupply, updateData, mint } = useWcdoProvider()

    const handleMint = async () => {
        const qt = inputNumber.current.value
        setLoading(true)

        try {
            await mint(qt)
            toast({
                description: "Minté avec succes.",
                status: 'success',
                isClosable: true,
            })
        }
        catch (e) {
            toast({
                description: e.reason ?? "Une erreur s'est produite!",
                status: 'error',
                isClosable: true,
            })
        }

        setLoading(false)
        updateData()
    }

    return (
        <Card mt="1rem" align="center">
            <CardHeader>
                <Heading size='md'>Minter un Wcdo NFT pour 0.1 ETH (2 max / wallet)</Heading>
            </CardHeader>
            <CardBody align="center">
                <Image src="/0.png" width="200" height="200" alt='wcdo' />
                <Text mt="1rem">Total Minted {totalSupply.toString()} / 1000</Text>
                <Text>You minted {minted.toString()} / 2</Text>
                <NumberInput defaultValue={2} min={1} max={2} mt="1rem" mb="1rem">
                    <NumberInputField ref={inputNumber} />
                    <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Button colorScheme='blue' onClick={handleMint} isLoading={isLoading}>Mint</Button>
            </CardBody>
            <CardFooter>
            </CardFooter>
        </Card>
    )
}

export default Wcdo