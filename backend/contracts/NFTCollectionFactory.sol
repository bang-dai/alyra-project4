// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "hardhat/console.sol";
import "./NFTCollection.sol";

contract NFTCollectionFactory {
    //all NFT collections created
    address[] NFTcollections;
    //my NFT collections created : user_addr => [collection_addr]
    mapping(address => address[]) myCollections;

    event NFTCollectionCreated(string name, string symbol);
    event NFTCollectionAddr(address indexed addr);

    /**
     * @notice initialize the NFT collection name, symbol, description and imageURL
     * @dev This function is called by the factory
     * @param _name the collection's name
     * @param _symbol the collection's symbol
     * @param _desc the collection's description
     * @param _imageURL the collection's imageURL
     */
    function deploy(
        string calldata _name,
        string calldata _symbol,
        string calldata _desc,
        string calldata _imageURL,
        address _sender,
        address _nftMarketPlaceAddr
    ) external {
        require(bytes(_name).length > 0, "Name couldn't be empty!");
        bytes32 salt = keccak256(abi.encodePacked(_name, _symbol));
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2
        address addr = address(new NFTCollection{salt: salt}());
        NFTCollection(addr).init(
            _name,
            _symbol,
            _desc,
            _imageURL,
            _sender,
            _nftMarketPlaceAddr
        );
        //insert into collection
        NFTcollections.push(addr);
        //insert this addr to my entries
        myCollections[_sender].push(addr);

        emit NFTCollectionCreated(_name, _symbol);
        emit NFTCollectionAddr(addr);
    }

    /**
     * @notice return all collection address created by this factory
     **/
    function getNFTCollections() external view returns (address[] memory) {
        return NFTcollections;
    }

    /**
     * @notice return all collection address created by this factory where I'm the owner
     **/
    function getMyCollections() external view returns (address[] memory) {
        return myCollections[msg.sender];
    }
}
