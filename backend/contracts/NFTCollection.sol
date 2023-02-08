// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollection is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address private _marketplaceContract;

    constructor() ERC721("name", "symbol") {}

    function init(
        string calldata name,
        string calldata symbol,
        address _marketPlace
    ) external onlyOwner {
        _name = name;
        _symbol = symbol;
        _marketplaceContract = _marketPlace;
    }
}
