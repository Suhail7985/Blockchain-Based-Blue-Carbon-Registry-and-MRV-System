// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CarbonMarketplace is Ownable, ReentrancyGuard {
    
    struct Listing {
        uint256 id;
        address seller;
        address tokenAddress;
        uint256 amount;
        uint256 pricePerToken; // In Wei
        bool isActive;
    }

    uint256 public nextListingId;
    mapping(uint256 => Listing) public listings;
    
    event CreditsListed(uint256 indexed listingId, address indexed seller, uint256 amount, uint256 pricePerToken);
    event CreditsPurchased(uint256 indexed listingId, address indexed buyer, address indexed seller, uint256 amount, uint256 totalPrice);
    event ListingCancelled(uint256 indexed listingId);

    constructor() Ownable(msg.sender) {}

    function listCredits(address tokenAddress, uint256 amount, uint256 pricePerToken) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(pricePerToken > 0, "Price must be > 0");

        IERC20 token = IERC20(tokenAddress);
        require(token.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        listings[nextListingId] = Listing({
            id: nextListingId,
            seller: msg.sender,
            tokenAddress: tokenAddress,
            amount: amount,
            pricePerToken: pricePerToken,
            isActive: true
        });

        emit CreditsListed(nextListingId, msg.sender, amount, pricePerToken);
        nextListingId++;
    }

    function buyCredits(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        
        uint256 totalPrice = listing.amount * listing.pricePerToken;
        require(msg.value >= totalPrice, "Insufficient payment");

        listing.isActive = false;

        // Payment to seller
        (bool success, ) = payable(listing.seller).call{value: totalPrice}("");
        require(success, "Payment to seller failed");

        // tokens to buyer
        IERC20 token = IERC20(listing.tokenAddress);
        require(token.transfer(msg.sender, listing.amount), "Token transfer failed");

        // Refund excess ETH
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit CreditsPurchased(listingId, msg.sender, listing.seller, listing.amount, totalPrice);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(listing.seller == msg.sender, "Not the seller");

        listing.isActive = false;

        IERC20 token = IERC20(listing.tokenAddress);
        require(token.transfer(msg.sender, listing.amount), "Token refund failed");

        emit ListingCancelled(listingId);
    }
}
