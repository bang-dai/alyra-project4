// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Wcdo is ERC721A, Ownable {
    using Strings for uint256;
    uint8 private constant MAX_NFT_PER_ADDR = 2;
    uint16 private constant MAX_SUPPLY = 1000;
    uint256 private constant PRICE = 0.1 ether;
    string baseURI; //ipfs://CID/
    mapping(address => uint256) minted;
    event Withdraw(address owner, uint256 amount);

    constructor() ERC721A("Wcdo official collection", "WCDO") {}

    /**
     * @notice Get tokenURI
     * @param _tokenId the NFT ID
     * @return string tokenURI
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override(ERC721A)
        returns (string memory)
    {
        require(_exists(_tokenId), "URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));
    }

    /**
     * @notice Set a default URI for all collection
     * @param _baseURI the ipfs uri
     */
    function setBaseURI(string memory _baseURI) external onlyOwner {
        baseURI = _baseURI;
    }

    /**
     * @notice get the default URI for all collection
     * @return string the ipfs uri
     */
    function getBaseURI() external view onlyOwner returns (string memory) {
        return baseURI;
    }

    /**
     * @notice Mint a maximum of 2 NFT for 0,1 eth each
     * @param _qt the quantity you want to mint
     */
    function mint(uint16 _qt) external payable {
        require(
            minted[msg.sender] + _qt <= MAX_NFT_PER_ADDR,
            "You can only mint 2 NFTs"
        );
        require(
            totalSupply() + _qt <= MAX_SUPPLY,
            "Max supply exceeded. Mint sold out!"
        );
        require(msg.value >= _qt * PRICE, "Not enough funds provided");
        minted[msg.sender] += _qt;
        _mint(msg.sender, _qt);
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
}
