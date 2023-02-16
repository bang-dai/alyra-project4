// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "./ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketPlace is Ownable {
    struct NFTListing {
        uint256 price;
        address seller;
        address nftCollection;
    }

    //mapping by nft_collection_address
    mapping(address => mapping(uint256 => NFTListing)) private _listings;

    event NFTListed(uint256 tokenId, uint256 price);
    event NFTTransfer(uint256 tokenId, address to);
    event NFTCancel(uint256 tokenId, address to);
    event Withdraw(address owner, uint256 amount);
    event NFTCollectionCreated(string name, string symbol);
    event NFTCollectionAddr(address indexed addr);

    modifier onlyTokenOwner(address _nftCollection, uint256 _tokenId) {
        require(
            ERC721A(_nftCollection).ownerOf(_tokenId) == msg.sender,
            "You are not the owner of the token."
        );
        _;
    }

    constructor() {}

    function listNFT(
        uint256 _tokenId,
        uint256 _price,
        address _nftCollection
    ) public onlyTokenOwner(_nftCollection, _tokenId) {
        require(_price > 0, "Price must be greater than 0.");
        //ERC721A(_nftCollection).approve(address(this), _tokenId);
        //ERC721A(_nftCollection).setApprovalForAll(address(this), true);
        // ERC721A(_nftCollection).transferFrom(
        //     msg.sender,
        //     address(this),
        //     _tokenId
        // );
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
        require(listing.seller != msg.sender, "You can't buy your NFT");
        //should the price is equal??
        require(msg.value >= listing.price, "Your price is incorrect!");

        //todo: here ERC721 should be the NFT SC address
        address owner = ERC721A(_nftCollection).ownerOf(_tokenId);
        ERC721A(_nftCollection).transferFrom(owner, msg.sender, _tokenId);
        //todo: add royalties in SC
        (bool success, ) = listing.seller.call{
            value: (listing.price * 98) / 100
        }(""); //plateform fee = 2%
        if (success) {
            _clearListing(_tokenId, _nftCollection);
            emit NFTTransfer(_tokenId, msg.sender);
        }
    }

    function cancelListing(uint256 _tokenId, address _nftCollection)
        public
        onlyTokenOwner(_nftCollection, _tokenId)
    {
        NFTListing memory listing = _listings[_nftCollection][_tokenId];
        require(listing.price > 0, "NFT not listed for sale!");
        // ERC721A(_nftCollection).transferFrom(
        //     address(this),
        //     msg.sender,
        //     _tokenId
        // );
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
    ) external onlyTokenOwner(_nftCollection, _tokenId) {
        ERC721A(_nftCollection).safeTransferFrom(msg.sender, _to, _tokenId);
        _clearListing(_tokenId, _nftCollection);
    }
}
