// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BillboardToken} from "../src/BillboardToken.sol";
import {USDCMock} from "../src/mocks/USDCMock.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {PermitSignature} from "./utils/PermitSignature.sol";

contract BillboardTokenTest is Test {
    BillboardToken public token;
    USDCMock public usdc;
    PermitSignature public permitSignature;

    address public owner;
    address public buyer = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    uint256 public privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address public user2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    uint256 public constant TOTAL_SUPPLY = 10_000_000 * 10 ** 18;
    uint256 public constant USDC_DECIMALS = 6;
    uint256 public constant TOKEN_DECIMALS = 18;

    function setUp() public {
        owner = address(this);
        permitSignature = new PermitSignature();

        usdc = new USDCMock();
        token = new BillboardToken(address(usdc));

        usdc.mint(buyer, 1_000_000 * 10 ** USDC_DECIMALS);
        vm.startPrank(buyer);
        usdc.approve(address(token), type(uint256).max);
        vm.stopPrank();
    }

    function test_Initialization() public view {
        assertEq(token.name(), "Billboard Governance Token");
        assertEq(token.symbol(), "BBT");
        assertEq(token.totalSupply(), TOTAL_SUPPLY);
        assertEq(token.balanceOf(owner), TOTAL_SUPPLY);
        assertEq(address(token.usdc()), address(usdc));
    }

    function test_BuyTokens() public {
        uint256 usdcAmount = 1000 * 10 ** USDC_DECIMALS;
        uint256 expectedBbtAmount = 1000 * 10 ** TOKEN_DECIMALS;

        vm.startPrank(buyer);
        uint256 initialBalance = token.balanceOf(buyer);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), buyer, address(token), usdcAmount, privateKey, deadline);

        token.buyTokens(usdcAmount, deadline, v, r, s);
        vm.stopPrank();

        assertEq(token.balanceOf(buyer), initialBalance + expectedBbtAmount);
        assertEq(usdc.balanceOf(address(token)), usdcAmount);
        assertEq(token.soldTokens(), expectedBbtAmount);
    }

    function test_BuyTokens_RevertWhenAmountZero() public {
        vm.startPrank(buyer);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), buyer, address(token), 1, privateKey, deadline);
        vm.expectRevert("Amount must be greater than 0");
        token.buyTokens(0, deadline, v, r, s);
        vm.stopPrank();
    }

    function test_BuyTokens_RevertWhenExceedsOneMillion() public {
        uint256 usdcAmount = 1_000_001 * 10 ** USDC_DECIMALS;

        vm.startPrank(buyer);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), buyer, address(token), usdcAmount, privateKey, deadline);
        vm.expectRevert(
            abi.encodeWithSelector(
                IERC20Errors.ERC20InsufficientBalance.selector,
                buyer,
                1_000_000 * 10 ** USDC_DECIMALS,
                1_000_001 * 10 ** USDC_DECIMALS
            )
        );
        token.buyTokens(usdcAmount, deadline, v, r, s);
        vm.stopPrank();
    }

    function test_WithdrawUSDC() public {
        uint256 usdcAmount = 1000 * 10 ** USDC_DECIMALS;

        vm.startPrank(buyer);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), buyer, address(token), usdcAmount, privateKey, deadline);
        token.buyTokens(usdcAmount, deadline, v, r, s);
        vm.stopPrank();

        uint256 initialBalance = usdc.balanceOf(owner);
        token.withdrawUSDC(usdcAmount);
        uint256 finalBalance = usdc.balanceOf(owner);

        assertEq(finalBalance - initialBalance, usdcAmount);
        assertEq(usdc.balanceOf(address(token)), 0);
    }

    function test_WithdrawUSDC_RevertWhenAmountZero() public {
        vm.expectRevert("Amount must be greater than 0");
        token.withdrawUSDC(0);
    }

    function test_WithdrawUSDC_RevertWhenNotOwner() public {
        uint256 usdcAmount = 1000 * 10 ** USDC_DECIMALS;

        vm.startPrank(buyer);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, buyer));
        token.withdrawUSDC(usdcAmount);
        vm.stopPrank();
    }

    function test_WithdrawUSDC_RevertWhenInsufficientBalance() public {
        uint256 usdcAmount = 1000 * 10 ** USDC_DECIMALS;

        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(token), 0, usdcAmount)
        );
        token.withdrawUSDC(usdcAmount);
    }

    function test_MultipleBuys() public {
        uint256 usdcAmount1 = 500 * 10 ** USDC_DECIMALS;
        uint256 usdcAmount2 = 300 * 10 ** USDC_DECIMALS;
        uint256 expectedTotal = 800 * 10 ** TOKEN_DECIMALS;

        vm.startPrank(buyer);

        uint256 deadline1 = block.timestamp + 1 hours;
        (uint8 v1, bytes32 r1, bytes32 s1) =
            permitSignature.getPermitSignature(address(usdc), buyer, address(token), usdcAmount1, privateKey, deadline1);
        token.buyTokens(usdcAmount1, deadline1, v1, r1, s1);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) =
            permitSignature.getPermitSignature(address(usdc), buyer, address(token), usdcAmount2, privateKey, deadline2);

        token.buyTokens(usdcAmount2, deadline2, v2, r2, s2);
        vm.stopPrank();

        assertEq(token.balanceOf(buyer), expectedTotal);
        assertEq(token.soldTokens(), expectedTotal);
        assertEq(usdc.balanceOf(address(token)), usdcAmount1 + usdcAmount2);
    }

    function test_BuyTokens_ExactOneMillion() public {
        uint256 usdcAmount = 1_000_000 * 10 ** USDC_DECIMALS;
        uint256 expectedBbtAmount = 1_000_000 * 10 ** TOKEN_DECIMALS;

        vm.startPrank(buyer);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), buyer, address(token), usdcAmount, privateKey, deadline);
        token.buyTokens(usdcAmount, deadline, v, r, s);
        vm.stopPrank();

        assertEq(token.balanceOf(buyer), expectedBbtAmount);
        assertEq(token.soldTokens(), expectedBbtAmount);
        assertEq(usdc.balanceOf(address(token)), usdcAmount);
    }
}
