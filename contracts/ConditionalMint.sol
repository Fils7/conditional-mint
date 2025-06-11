// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Conditional is ERC721, ERC721URIStorage, Ownable {
    uint256 public constant PRICE = 0.01 ether;
    address public platformWallet;
    uint256 public nextTokenId = 1;

    event PurchaseCreated(address indexed buyer, uint256 value);
    event NFTMinted(address indexed to, uint256 tokenId);
    event Refunded(address indexed to, uint256 amount);

    constructor(address initialOwner, address _platformWallet)
        ERC721("Conditional", "CM")
        Ownable(initialOwner)
    {
        platformWallet = _platformWallet;
    }

    // Function for the user to purchase (sends ETH)
    function purchase() external payable {
        require(msg.value == PRICE, "Invalid value");
        emit PurchaseCreated(msg.sender, msg.value); // The backend will listen to this event and decide whether to approve or reject
    }

    // Mint after approval (only owner/backend can call)
    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit NFTMinted(to, tokenId);
    }

    // Refund in case of rejection (only owner/backend can call)
    function refund(address to, uint256 amount) public onlyOwner {
        (bool sent, ) = payable(to).call{value: amount}("");
        require(sent, "Failed refund");
        emit Refunded(to, amount);
    }

    // Allows receiving ETH directly
    receive() external payable {}

    // Allows receiving ETH if called with data or non-existent function
    fallback() external payable {}

    // The following functions are overrides required by Solidity.
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
