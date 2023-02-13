// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Wcdo is ERC721A, Ownable {
    using Strings for uint256;
    uint256 private constant MAX_NFT_PER_ADDR = 2;
    uint256 private constant MAX_SUPPLY = 500;

    mapping(address => uint256) minted;
    string baseURI; //get URI from NFT.storage

    constructor() ERC721A("Wcdo NFT", "WCDO") {}

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721A)
        returns (string memory)
    {
        require(_exists(_tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, _tokenId.toString()));
    }

    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    function mint(uint256 _qt) external {
        require(
            minted[msg.sender] + _qt <= MAX_NFT_PER_ADDR,
            "You can only mint 2 NFTs"
        );
        require(
            totalSupply() + _qt <= MAX_SUPPLY,
            "Max supply exceeded. Mint sold out!"
        );
        minted[msg.sender] += _qt;
        _mint(msg.sender, _qt);
    }
}
