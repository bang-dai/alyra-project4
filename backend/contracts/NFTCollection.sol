// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;
    address private _marketplaceContract;

    event NFTCreated(uint256 tokenId, string uri);

    constructor() ERC721("name", "symbol") {}

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
