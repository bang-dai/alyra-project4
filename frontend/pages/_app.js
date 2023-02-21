import '@/styles/globals.css'

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { goerli, hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ChakraProvider } from '@chakra-ui/react'
import { ContractNFTProvider } from '@/context/ContractNFTContext';
import { NFTMarketProvider } from '@/context/NFTMarketContext';
import { WcdoProvider } from '@/context/WcdoContext';

const { chains, provider } = configureChains(
  [goerli, hardhat],
  [
    //alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});
const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider
})

export default function App({ Component, pageProps }) {
  return (
    <ChakraProvider>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains}>
          <NFTMarketProvider>
            <ContractNFTProvider>
              <WcdoProvider>
                <Component {...pageProps} />
              </WcdoProvider>
            </ContractNFTProvider>
          </NFTMarketProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>

  )
}