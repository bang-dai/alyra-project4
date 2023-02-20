import { Box, Center, IconButton, Text, Flex, useColorMode, useColorModeValue, Button } from '@chakra-ui/react'
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import Link from 'next/link';
import Search from './Search';
import { useContractNFTProvider } from '@/context/ContractNFTContext';

const Header = ({ showSidebarButton = true, onShowSidebar }) => {
    const { colorMode, toggleColorMode } = useColorMode()
    const { isConnected } = useContractNFTProvider()

    return (
        <Flex minH="10vh" alignItems={'center'} justifyContent="space-between" borderBottomWidth="1px" borderBottomColor={'gray.700'}>
            <Flex direction="row">
                <Link href="/"><Image src="/h2o.jpg" width="100" height="100" alt='logo of H2O marketplace' /></Link>
                {isConnected && <Search />}
            </Flex>
            <Flex justifyContent="space-around">
                <Link href="/"><Button m="1rem">Home</Button></Link>
                <Link href="/mynfts"><Button m="1rem">Mes NFTs</Button></Link>
                <Link href="/collections"><Button m="1rem">Mes collections</Button></Link>
                <Link href="/create"><Button m="1rem">Créer</Button></Link>
                <Button m="1rem">Minter</Button>
            </Flex>
            <Flex>
                <IconButton aria-label="Toggle Mode" onClick={toggleColorMode} mr='2rem'>
                    {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                </IconButton>
                <ConnectButton />
            </Flex>
        </Flex>
    )
}

export default Header