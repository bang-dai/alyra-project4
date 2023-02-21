import React, { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import Contract from '../../backend/artifacts/contracts/Wcdo.sol/Wcdo.json' //update here
import { useAccount, useBalance, useProvider, useSigner } from "wagmi";

const WcdoContext = React.createContext(null)

export function useWcdoProvider() {
    const context = useContext(WcdoContext)

    if (!context) {
        throw new Error('useWcdoProvider must be used within a WcdoProvider')
    }
    return context
}

export const WcdoProvider = ({ children }) => {
    const contractAddress = process.env.NEXT_PUBLIC_WCDO_ADDR
    const [totalSupply, setTotalSupply] = useState(0)
    const [minted, setMinted] = useState(0)
    const { address, isConnected } = useAccount()
    //get signer && provider to call SC function
    const provider = useProvider()
    const { data: signer } = useSigner()
    //keep our balance up to date
    const { data, isError, isLoading } = useBalance({
        address: address,
        watch: true
    })

    //write contract
    const contract = new ethers.Contract(contractAddress, Contract.abi, signer)
    //read contract
    const contractRead = new ethers.Contract(contractAddress, Contract.abi, provider)

    useEffect(() => {
        console.log("in")
        if (isConnected) {
            updateData()
        }
    }, [isConnected, address])

    const updateData = () => {
        getTotalMinted()
        getMinted()
    }

    //Create all SC function here
    const getMinted = async () => {
        const minted = await contractRead.connect(address).balanceOf(address)
        setMinted(minted)
    }

    const getTotalMinted = async () => {
        const totalSupply = await contractRead.connect(address).totalSupply()
        setTotalSupply(totalSupply)
    }

    const mint = async (qt) => {
        const price = qt * 0.1
        const transaction = await contract.mint(qt, { value: ethers.utils.parseEther(price.toString()) })
        await transaction.wait(1) //= wait(1) même chose
    }


    return (
        <WcdoContext.Provider value={{ contractAddress, Contract, address, isConnected, minted, totalSupply, updateData, mint }}>
            {children}
        </WcdoContext.Provider>
    )
}

export default WcdoContext