// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract NFTMarketPlace is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct NFTListing {
        uint256 price;
        address seller;
    }

    mapping(uint256 => NFTListing) private _listings;
    event NFTCreated(uint256 tokenId, string uri);
    event NFTListed(uint256 tokenId, uint256 price);
    event NFTTransfer(uint256 tokenId, address to);
    event Withdraw(address owner, uint256 amount);

    constructor() ERC721("MyToken", "MTK") {}

    function createNFT(string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        emit NFTCreated(tokenId, uri);

        return tokenId;
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(price > 0, "Price must be greater than 0.");
        approve(address(this), tokenId);
        //setApprovalForAll(address(this), true); //ne devrait marcher que si le SC est celui de la collection
        _listings[tokenId] = NFTListing(price, msg.sender);
        emit NFTListed(tokenId, price);
    }

    function buyNFT(uint256 tokenId) public payable {
        NFTListing memory listing = _listings[tokenId];
        require(listing.price > 0, "NFT not listed for sale!");
        require(msg.value >= listing.price, "Your price is incorrect!");
        safeTransferFrom(address(this), msg.sender, tokenId);
        //todo: add royalties in SC
        (bool success, ) = listing.seller.call{value: listing.price}("");
        if (success) {
            _clearListing(tokenId);
            emit NFTTransfer(tokenId, msg.sender);
        }
    }

    function cancelListing(uint256 tokenId) public {
        NFTListing memory listing = _listings[tokenId];
        require(listing.price > 0, "NFT not listed for sale!");
        require(
            listing.seller == msg.sender,
            "You are not the owner of this NFT!"
        );
        _clearListing(tokenId);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Empty balance");
        (bool success, ) = owner().call{value: balance}("");
        if (success) {
            emit Withdraw(owner(), balance);
        }
    }

    function _clearListing(uint256 tokenId) private {
        _listings[tokenId].price = 0;
        _listings[tokenId].seller = address(0);
    }
}
