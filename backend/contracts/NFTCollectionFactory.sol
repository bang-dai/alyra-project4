// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./NFTCollection.sol";

contract NFTCollectionFactory {
    //store created NFT collection : user_addr => [collection_addr]
    mapping(address => address[]) NFTcollections;

    event NFTCollectionCreated(string name, string symbol);
    event NFTCollectionAddr(address indexed addr);

    function deploy(
        string calldata _name,
        string calldata _symbol,
        address _nftMarketPlaceAddr
    ) public {
        require(bytes(_name).length > 0, "Name couldn't be empty!");
        bytes32 salt = keccak256(abi.encodePacked(_name, _symbol));
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2
        address addr = address(new NFTCollection{salt: salt}());
        NFTCollection(addr).init(_name, _symbol, _nftMarketPlaceAddr);
        NFTcollections[msg.sender].push(addr);

        emit NFTCollectionCreated(_name, _symbol);
        emit NFTCollectionAddr(addr);
    }

    /**
     * @notice return all collection address from deployer
     **/
    function getNFTCollections() external view returns (address[] memory) {
        return NFTcollections[msg.sender];
    }
}
