// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

//attention: import le fichier car modification des visibilités _name et _symbol
import "./ERC721URIStorage.sol";
import "./ERC721AQueryable.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    address private _marketplaceContract;
    //name of NFT is in metadata
    string description;

    event NFTCreated(uint256 tokenId, string uri);

    constructor() ERC721A("name", "symbol") {}

    /**
     * @notice initialize the NFT collection name and symbol
     * @dev This function is called by the factory
     * @param name the collection's name
     * @param symbol the collection's symbol
     */
    function init(
        string calldata name,
        string calldata symbol,
        string calldata desc,
        address sender,
        address marketPlace
    ) external onlyOwner {
        _name = name;
        _symbol = symbol;
        description = desc;
        _marketplaceContract = marketPlace;
        transferOwnership(sender);
    }

    /**
     * @notice create new NFT for this collection
     * @dev This function is called by only owner
     * @param _uri only uri need, because metadata contains name, description and image ipfs
     */
    function createNFT(string memory _uri) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, 1);
        _setTokenURI(tokenId, _uri);
        //give permission for marketplace to trade our NFT
        setApprovalForAll(_marketplaceContract, true);
        emit NFTCreated(tokenId, _uri);

        return tokenId;
    }

    function getDescription() external view returns (string memory) {
        return description;
    }

    function tokensOfOwner(address owner)
        external
        view
        virtual
        returns (uint256[] memory)
    {
        unchecked {
            uint256 tokenIdsIdx;
            address currOwnershipAddr;
            uint256 tokenIdsLength = balanceOf(owner);
            uint256[] memory tokenIds = new uint256[](tokenIdsLength);
            TokenOwnership memory ownership;
            for (
                uint256 i = _startTokenId();
                tokenIdsIdx != tokenIdsLength;
                ++i
            ) {
                ownership = _ownershipAt(i);
                if (ownership.burned) {
                    continue;
                }
                if (ownership.addr != address(0)) {
                    currOwnershipAddr = ownership.addr;
                }
                if (currOwnershipAddr == owner) {
                    tokenIds[tokenIdsIdx++] = i;
                }
            }
            return tokenIds;
        }
    }
}
