import { NFTStorage } from 'nft.storage'
const NFT_STORAGE_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_KEY
const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

export const ipfsToHTTPS = (url) => {
    if (!url.startsWith("ipfs://")) throw new Error("Not an IPFS url");
    const cid = url.substring(7);
    return `https://gateway.ipfs.io/ipfs/${cid}`;
};

export const minifyAddress = (address) => {
    const start = address.substring(0, 5);
    const end = address.substring(address.length - 4);
    return `${start}...${end}`;
};


export const storeNFT = async (image, name, desc) => {
    const metadata = await nftstorage.store({
        image: image,
        name: name,
        description: desc,
    })

    return metadata
}
