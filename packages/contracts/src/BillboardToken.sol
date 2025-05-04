// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BillboardToken is ERC20, Ownable {
    IERC20 public immutable usdc;
    uint256 public constant TOTAL_SUPPLY = 10_000_000 * 10 ** 18;
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant TOKEN_DECIMALS = 18;
    uint256 public soldTokens = 0;

    constructor(address _usdc) ERC20("Billboard Governance Token", "BBT") Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        _mint(msg.sender, TOTAL_SUPPLY);
    }

    function buyTokens(uint256 usdcAmount) external {
        require(usdcAmount > 0, "Amount must be greater than 0");
        require(usdc.transferFrom(msg.sender, address(this), usdcAmount), "USDC transfer failed");

        uint256 bbtAmount = usdcAmount * 10 ** (TOKEN_DECIMALS - USDC_DECIMALS);
        soldTokens += bbtAmount;
        require(soldTokens <= 1_000_000 * 10 ** 18, "Sold tokens exceeds 1 million");
        _transfer(owner(), msg.sender, bbtAmount);
    }

    function withdrawUSDC(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.transfer(owner(), amount), "USDC transfer failed");
    }
}
