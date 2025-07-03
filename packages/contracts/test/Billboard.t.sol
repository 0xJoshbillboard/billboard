// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BillboardRegistry} from "../src/BillboardRegistry.sol";
import {BillboardProxy} from "../src/BillboardProxy.sol";
import {USDCMock} from "../src/mocks/USDCMock.sol";
import {BillboardGovernance} from "../src/BillboardGovernance.sol";
import {BillboardGovernanceProxy} from "../src/BillboardGovernanceProxy.sol";
import {BillboardToken} from "../src/BillboardToken.sol";
import {PermitSignature} from "./utils/PermitSignature.sol";

contract BillboardTest is Test {
    BillboardRegistry public registry;
    BillboardProxy public proxy;
    USDCMock public usdc;
    BillboardGovernance public governance;
    BillboardGovernanceProxy public governanceProxy;
    BillboardToken public billboardToken;
    PermitSignature public permitSignature;
    address public user = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    uint256 public privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 public initialBalance = 1000000e6;
    uint256 public securityDepositForProvider = 1000e6;
    uint256 public securityDepositForProposal = 1000e6;

    function setUp() public {
        permitSignature = new PermitSignature();
        usdc = new USDCMock();
        billboardToken = new BillboardToken(address(usdc));

        registry = new BillboardRegistry();
        proxy = new BillboardProxy(address(registry), address(this), "");

        governance = new BillboardGovernance();
        governanceProxy = new BillboardGovernanceProxy(address(governance), address(this), "");

        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));
        BillboardGovernance(address(governanceProxy)).initialize(
            30 days, 1000e6, securityDepositForProposal, address(usdc), securityDepositForProvider, 500e6
        );

        usdc.mint(address(this), initialBalance);

        vm.label(user, "User");
        usdc.mint(user, initialBalance);

        vm.startPrank(user);
        usdc.approve(address(billboardToken), type(uint256).max);
        billboardToken.buyTokensWithApprove(10000e6);
        vm.stopPrank();
    }

    function test_PurchaseBillboard() public {
        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline);
        BillboardRegistry(address(proxy)).purchaseBillboard(
            "Test Billboard", "https://test.com", "test.com", true, deadline, v, r, s
        );
        vm.stopPrank();
    }

    function test_BillboardData() public {
        vm.startPrank(user);
        vm.warp(1000);

        assertEq(BillboardGovernance(address(governanceProxy)).duration(), 30 days);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline);
        BillboardRegistry(address(proxy)).purchaseBillboard(
            "Test Billboard", "https://test.com", "test.com", true, deadline, v, r, s
        );

        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(user);

        assertEq(billboards.length, 1);
        assertEq(billboards[0].owner, user);
        assertEq(billboards[0].expiryTime, 1000 + 30 days);
        assertEq(billboards[0].description, "Test Billboard");
        assertEq(billboards[0].link, "https://test.com");
        assertEq(billboards[0].hash, "test.com");
        vm.stopPrank();
    }

    function test_PurchaseBillboardEvent() public {
        vm.startPrank(user);
        vm.warp(1000);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline);

        vm.expectEmit(true, true, true, true);
        emit BillboardRegistry.BillboardPurchased(
            user, block.timestamp + 30 days, "Test Billboard", "https://test.com", "test.com", true
        );
        BillboardRegistry(address(proxy)).purchaseBillboard(
            "Test Billboard", "https://test.com", "test.com", true, deadline, v, r, s
        );
        vm.stopPrank();
    }

    function test_ExtendBillboard() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline);
        BillboardRegistry(address(proxy)).purchaseBillboard(
            "Test Billboard", "https://test.com", "test.com", true, deadline, v, r, s
        );

        vm.warp(1000);
        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline2);

        BillboardRegistry(address(proxy)).extendBillboard(0, deadline2, v2, r2, s2);

        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(user);

        assertEq(billboards.length, 1);
        assertEq(billboards[0].expiryTime, block.timestamp + 30 days);
        assertEq(billboards[0].owner, user);
        assertEq(billboards[0].description, "Test Billboard");
        assertEq(billboards[0].link, "https://test.com");
        assertEq(billboards[0].hash, "test.com");
        assertEq(billboards[0].vertical, true);
        vm.stopPrank();
    }

    function test_ExtendBillboardEvent() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline);
        BillboardRegistry(address(proxy)).purchaseBillboard(
            "Test Billboard", "https://test.com", "test.com", true, deadline, v, r, s
        );

        vm.warp(1000);

        vm.expectEmit(true, true, true, true);
        emit BillboardRegistry.BillboardExtended(user, 0, block.timestamp + 30 days);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline2);
        BillboardRegistry(address(proxy)).extendBillboard(0, deadline2, v2, r2, s2);
        vm.stopPrank();
    }

    function test_WithdrawFunds() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 1000e6, privateKey, deadline);
        BillboardRegistry(address(proxy)).purchaseBillboard(
            "Test Billboard", "https://test.com", "test.com", true, deadline, v, r, s
        );
        vm.stopPrank();

        vm.warp(1000);
        BillboardRegistry(address(proxy)).withdrawFunds(address(usdc));

        assertEq(usdc.balanceOf(address(proxy)), 0);
        assertEq(usdc.balanceOf(address(this)), initialBalance + 1000e6);
    }

    function test_RegisterBillboardAdvertiser() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline
        );

        vm.expectEmit(true, true, true, true);
        emit BillboardRegistry.BillboardAdvertiserRegistered(user, "testprovider");
        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);
        vm.stopPrank();

        string memory handle = BillboardRegistry(address(proxy)).getBillboardAdvertiser(user).handle;
        assertEq(handle, "testprovider");
    }

    function test_WithdrawSecurityDepositForAdvertiser() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline
        );

        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);
        uint256 initialUserBalance = usdc.balanceOf(user);

        vm.expectRevert("Deposit locked for 30 days");
        BillboardRegistry(address(proxy)).withdrawSecurityDepositForAdvertiser();

        vm.warp(block.timestamp + 30 days);

        vm.expectEmit(true, true, true, true);
        emit BillboardRegistry.SecurityDepositWithdrawn(user, securityDepositForProvider);

        BillboardRegistry(address(proxy)).withdrawSecurityDepositForAdvertiser();

        assertEq(usdc.balanceOf(user), initialUserBalance + securityDepositForProvider);

        vm.expectRevert("Deposit already withdrawn");
        BillboardRegistry(address(proxy)).withdrawSecurityDepositForAdvertiser();

        vm.stopPrank();
    }

    function test_GetBillboardAdvertiser() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline
        );

        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);
        vm.stopPrank();

        string memory handle = BillboardRegistry(address(proxy)).getBillboardAdvertiser(user).handle;
        assertEq(handle, "testprovider");

        string memory emptyHandle = BillboardRegistry(address(proxy)).getBillboardAdvertiser(address(0x2)).handle;
        assertEq(emptyHandle, "");
    }

    function test_RegisterBillboardAdvertiserTwice() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline
        );

        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);

        vm.expectRevert("Advertiser already registered");
        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("newprovider", deadline, v, r, s);

        vm.stopPrank();
    }

    function test_RegisterWithdrawRegisterAgain() public {
        vm.startPrank(user);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline
        );

        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);

        vm.warp(block.timestamp + 30 days);

        BillboardRegistry(address(proxy)).withdrawSecurityDepositForAdvertiser();

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline2
        );

        vm.expectRevert("Advertiser already registered");
        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("newprovider", deadline2, v2, r2, s2);

        vm.stopPrank();
    }

    function test_MultipleWithdrawalAttempts() public {
        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline
        );

        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);

        vm.warp(block.timestamp + 30 days);

        BillboardRegistry(address(proxy)).withdrawSecurityDepositForAdvertiser();

        vm.expectRevert("Deposit already withdrawn");
        BillboardRegistry(address(proxy)).withdrawSecurityDepositForAdvertiser();

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositForProvider, privateKey, deadline2
        );

        vm.expectRevert("Advertiser already registered");
        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("newprovider", deadline2, v2, r2, s2);

        vm.stopPrank();
    }
}
