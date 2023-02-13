// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketPlace is ERC721, Ownable {
    struct NFTListing {
        uint256 price;
        address seller;
        address nftCollection;
    }

    mapping(address => mapping(uint256 => NFTListing)) private _listings;

    event NFTListed(uint256 tokenId, uint256 price);
    event NFTTransfer(uint256 tokenId, address to);
    event NFTCancel(uint256 tokenId, address to);
    event Withdraw(address owner, uint256 amount);
    event NFTCollectionCreated(string name, string symbol);
    event NFTCollectionAddr(address indexed addr);

    constructor() ERC721("H2O marketplace", "H2O") {}

    function listNFT(
        uint256 _tokenId,
        uint256 _price,
        address _nftCollection
    ) public {
        require(_price > 0, "Price must be greater than 0.");
        //ERC721(_nftCollection).approve(address(this), _tokenId);
        //setApprovalForAll(address(this), true);
        ERC721(_nftCollection).transferFrom(
            msg.sender,
            address(this),
            _tokenId
        );
        _listings[_nftCollection][_tokenId] = NFTListing(
            _price,
            msg.sender,
            _nftCollection
        );
        emit NFTListed(_tokenId, _price);
    }

    function buyNFT(uint256 _tokenId, address _nftCollection) public payable {
        NFTListing memory listing = _listings[_nftCollection][_tokenId];
        require(listing.price > 0, "NFT not listed for sale!");
        //should the price is equal??
        require(msg.value >= listing.price, "Your price is incorrect!");
        //todo: here ERC721 should be the NFT SC address
        ERC721(_nftCollection).safeTransferFrom(
            address(this),
            msg.sender,
            _tokenId
        );
        //todo: add royalties in SC
        (bool success, ) = listing.seller.call{
            value: (listing.price * 98) / 100
        }(""); //plateform fee = 2%
        if (success) {
            _clearListing(_tokenId, _nftCollection);
            emit NFTTransfer(_tokenId, msg.sender);
        }
    }

    function cancelListing(uint256 _tokenId, address _nftCollection) public {
        NFTListing memory listing = _listings[_nftCollection][_tokenId];
        require(listing.price > 0, "NFT not listed for sale!");
        require(
            listing.seller == msg.sender,
            "You are not the owner of this NFT!"
        );
        ERC721(_nftCollection).transferFrom(
            address(this),
            msg.sender,
            _tokenId
        );
        _clearListing(_tokenId, _nftCollection);

        emit NFTCancel(_tokenId, msg.sender);
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Empty balance");
        (bool success, ) = owner().call{value: balance}("");
        if (success) {
            emit Withdraw(owner(), balance);
        }
    }

    function _clearListing(uint256 _tokenId, address _nftCollection) private {
        _listings[_nftCollection][_tokenId].price = 0;
        _listings[_nftCollection][_tokenId].seller = address(0);
    }

    function tranfert(
        uint256 _tokenId,
        address _nftCollection,
        address _to
    ) external {
        require(
            ownerOf(_tokenId) == msg.sender,
            "You are not the owner of the token"
        );
        ERC721(_nftCollection).safeTransferFrom(msg.sender, _to, _tokenId);
        _clearListing(_tokenId, _nftCollection);
    }
}
