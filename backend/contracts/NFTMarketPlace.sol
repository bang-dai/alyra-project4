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

    //mapping of listing NFT by their nft_collection_address
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

    /**
     * @notice List my NFT to sale
     * @dev This function is called only for NFT's owner
     * @param _tokenId the NFT ID
     * @param _price the price in WEI
     * @param _nftCollection nft collection's address
     */
    function listNFT(
        uint256 _tokenId,
        uint256 _price,
        address _nftCollection
    ) external onlyTokenOwner(_nftCollection, _tokenId) {
        require(_price > 0, "Price must be greater than 0.");
        //could list, even if this NFT is already listed. Because we could change listing price
        _listings[_nftCollection][_tokenId] = NFTListing(
            _price,
            msg.sender,
            _nftCollection
        );
        emit NFTListed(_tokenId, _price);
    }

    /**
     * @notice Buy a NFT
     * @param _tokenId the NFT ID
     * @param _nftCollection nft collection's address
     */
    function buyNFT(uint256 _tokenId, address _nftCollection) external payable {
        NFTListing memory listing = _listings[_nftCollection][_tokenId];
        require(listing.price > 0, "NFT not listed for sale!");
        require(listing.seller != msg.sender, "You can't buy your NFT");
        //should the price is equal??
        require(msg.value >= listing.price, "Your price is incorrect!");

        //transfer NFT to buyer
        address owner = ERC721A(_nftCollection).ownerOf(_tokenId);
        ERC721A(_nftCollection).transferFrom(owner, msg.sender, _tokenId);
        //buyer gives 98% to seller and plateforme earn 2% fees
        (bool success, ) = listing.seller.call{
            value: (listing.price * 98) / 100
        }(""); //plateform fee = 2%
        if (success) {
            _clearListing(_tokenId, _nftCollection);
            emit NFTTransfer(_tokenId, msg.sender);
        } else {
            revert("Error occured when transfer eth to seller!");
        }
    }

    /**
     * @notice Buy a NFT
     * @param _tokenId the NFT ID
     * @param _nftCollection nft collection's address
     */
    function cancelListing(uint256 _tokenId, address _nftCollection)
        external
        onlyTokenOwner(_nftCollection, _tokenId)
    {
        NFTListing memory listing = _listings[_nftCollection][_tokenId];
        require(listing.price > 0, "NFT not listed for sale!");
        _clearListing(_tokenId, _nftCollection);

        emit NFTCancel(_tokenId, msg.sender);
    }

    /**
     * @notice Withdraw fund from SC to owner
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Empty balance");
        (bool success, ) = owner().call{value: balance}("");
        if (success) {
            emit Withdraw(owner(), balance);
        }
    }

    /**
     * @notice Clear listing by setting value to 0
     * @param _tokenId the NFT ID
     * @param _nftCollection nft collection's address
     */
    function _clearListing(uint256 _tokenId, address _nftCollection) private {
        _listings[_nftCollection][_tokenId].price = 0;
        _listings[_nftCollection][_tokenId].seller = address(0);
    }

    /**
     * @notice Transfer a NFT to another address
     * @param _tokenId the NFT ID
     * @param _nftCollection nft collection's address
     * @param _to destination's address
     */
    function tranfert(
        uint256 _tokenId,
        address _nftCollection,
        address _to
    ) external onlyTokenOwner(_nftCollection, _tokenId) {
        ERC721A(_nftCollection).safeTransferFrom(msg.sender, _to, _tokenId);
        _clearListing(_tokenId, _nftCollection);
    }

    /**
     * @notice get the Listing info
     * @param _collectionAddr nft collection's address
     * @param _tokenId the NFT ID
     * @return NFTListing the listing struct
     */
    function getListings(address _collectionAddr, uint256 _tokenId)
        external
        view
        returns (NFTListing memory)
    {
        return _listings[_collectionAddr][_tokenId];
    }
}
