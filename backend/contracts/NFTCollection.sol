// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

//attention: import le fichier car modification des visibilités _name et _symbol
import "./ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    address private _marketplaceContract;
    //name of NFT is in metadata
    string description;

    event NFTCreated(uint256 tokenId, string uri);

    constructor() ERC721("name", "symbol") {}

    /**
     * @notice initialize the NFT collection name and symbol
     * @dev This function is called by the factory
     * @param name the collection's name
     * @param symbol the collection's symbol
     */
    function init(
        string calldata name,
        string calldata symbol,
        address marketPlace
    ) external onlyOwner {
        _name = name;
        _symbol = symbol;
        _marketplaceContract = marketPlace;
    }

    function createNFT(string memory _uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);
        setApprovalForAll(_marketplaceContract, true);
        emit NFTCreated(tokenId, _uri);

        return tokenId;
    }
}
