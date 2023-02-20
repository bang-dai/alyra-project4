import Head from 'next/head'
import { useState } from 'react';
import { Box, Center, Flex, Heading, useBreakpointValue } from '@chakra-ui/react';
import Header from './Header';
import Footer from './Footer';
import { useContractNFTProvider } from '@/context/ContractNFTContext';

const smVariant = { navigation: 'drawer', showSidebarButton: true }
const mdVariant = { navigation: 'sidebar', showSidebarButton: false }

const Layout = ({ children, title }) => {
    const [isSidebarOpen, setSidebarOpen] = useState(false)
    const variants = useBreakpointValue({ base: smVariant, md: mdVariant })
    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen)
    const { isConnected } = useContractNFTProvider()

    return (
        <>
            <Head>
                <title>H2O maketplace</title>
                <meta name="description" content="H2O marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Box>
                <Header
                    showSidebarButton={variants?.showSidebarButton}
                    onShowSidebar={toggleSidebar}
                />
                <Flex justifyContent="center" minH={'80vh'}>
                    {isConnected ? (
                        <Flex direction="column" alignItems="center">
                            <Heading>{title}</Heading>
                            {children}
                        </Flex>

                    ) : (
                        <Center>Veuillez vous connecter!</Center>
                    )
                    }
                </Flex>
                <Footer />
            </Box>
        </>
    );
};

export default Layout;
