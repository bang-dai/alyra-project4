// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

//attention: import le fichier car modification des visibilités _name et _symbol
import "./ERC721URIStorage.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721URIStorage, Ownable {
    address private marketplaceContract;
    //description of collection
    string private description;
    //image URL of collection
    string private imageURL;

    event NFTCreated(uint256 tokenId, string uri);

    constructor() ERC721A("name", "symbol") {}

    /**
     * @notice initialize the NFT collection name and symbol
     * @dev This function is called by the factory and only for owner
     * @param name the collection's name
     * @param symbol the collection's symbol
     */
    function init(
        string calldata name,
        string calldata symbol,
        string calldata _desc,
        string calldata _imageURL,
        address sender,
        address marketPlace
    ) external onlyOwner {
        _name = name;
        _symbol = symbol;
        description = _desc;
        imageURL = _imageURL;
        marketplaceContract = marketPlace;
        transferOwnership(sender);
    }

    /**
     * @notice create new NFT for this collection
     * @dev This function is called by only owner
     * @param _uri only uri need, because metadata contains name, description and image ipfs
     */
    function createNFT(string memory _uri) external onlyOwner {
        uint256 tokenId = _nextTokenId();
        _safeMint(msg.sender, 1);
        _setTokenURI(tokenId, _uri);
        //give permission for marketplace to trade our NFT for the creator
        setApprovalForAll(marketplaceContract, true);
        emit NFTCreated(tokenId, _uri);
    }

    /**
     * @notice get description of collection
     * @return string description
     */
    function getDescription() external view returns (string memory) {
        return description;
    }

    /**
     * @notice get imageURL of collection
     * @return string imageURL
     */
    function getImageURL() external view returns (string memory) {
        return imageURL;
    }

    /**
     * @notice get tokenIds of the owner
     * @param owner the owner address
     * @return array of tokenIds of the owner
     */
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

    /**
     * @notice get the total amount of tokens minted.
     * @return uint the total amount of tokens minted.
     */
    function getTotalMinted() external view returns (uint256) {
        return _totalMinted();
    }
}
