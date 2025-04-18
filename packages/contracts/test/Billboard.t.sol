// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BillboardRegistry} from "../src/BillboardRegistry.sol";
import {BillboardProxy} from "../src/BillboardProxy.sol";
import {USDCMock} from "../src/mocks/USDCMock.sol";
import {BillboardGovernance} from "../src/BillboardGovernance.sol";
import {BillboardGovernanceProxy} from "../src/BillboardGovernanceProxy.sol";

contract BillboardTest is Test {
    BillboardRegistry public registry;
    BillboardProxy public proxy;
    USDCMock public usdc;
    BillboardGovernance public governance;
    BillboardGovernanceProxy public governanceProxy;

    address public owner;
    address public user;
    uint256 public initialBalance = 1000000e6;
    uint256 public securityDeposit = 5000e6;

    function setUp() public {
        usdc = new USDCMock();

        registry = new BillboardRegistry();
        proxy = new BillboardProxy(address(registry), address(this), "");

        governance = new BillboardGovernance();
        governanceProxy = new BillboardGovernanceProxy(address(governance), address(this), "");

        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));
        BillboardGovernance(address(governanceProxy)).initialize(30 days, 1000e6, securityDeposit);

        // Mint 1000000 USDC to the test contract
        usdc.mint(address(this), initialBalance);

        // Create a user for testing
        user = address(0x1);
        vm.label(user, "User");
        usdc.mint(user, initialBalance);
    }

    function test_PurchaseBillboard() public {
        usdc.approve(address(proxy), 1000e6);
        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test.com");
    }

    function test_BillboardData() public {
        vm.warp(1000);

        assertEq(BillboardGovernance(address(governanceProxy)).duration(), 30 days);

        usdc.approve(address(proxy), 1000e6);
        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test.com");

        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(address(this));

        assertEq(billboards.length, 1);
        assertEq(billboards[0].owner, address(this));
        assertEq(billboards[0].expiryTime, 1000 + 30 days);
        assertEq(billboards[0].description, "Test Billboard");
        assertEq(billboards[0].link, "https://test.com");
        assertEq(billboards[0].ipfsHash, "test.com");
    }

    function test_PurchaseBillboardEvent() public {
        usdc.approve(address(proxy), initialBalance);

        vm.expectEmit(true, true, true, true);
        console.logUint(block.timestamp + 30 days);
        emit BillboardRegistry.BillboardPurchased(
            address(this), block.timestamp + 30 days, "Test Billboard", "https://test.com", "test.com"
        );

        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test.com");
    }

    function test_ExtendBillboard() public {
        usdc.approve(address(proxy), initialBalance);
        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test.com");

        vm.warp(1000);
        BillboardRegistry(address(proxy)).extendBillboard(0);

        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(address(this));

        assertEq(billboards.length, 1);
        assertEq(billboards[0].expiryTime, block.timestamp + 30 days);
        assertEq(billboards[0].owner, address(this));
        assertEq(billboards[0].description, "Test Billboard");
        assertEq(billboards[0].link, "https://test.com");
        assertEq(billboards[0].ipfsHash, "test.com");
    }

    function test_ExtendBillboardEvent() public {
        usdc.approve(address(proxy), initialBalance);
        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test.com");

        vm.warp(1000);

        vm.expectEmit(true, true, true, true);
        emit BillboardRegistry.BillboardExtended(address(this), 0, block.timestamp + 30 days);

        BillboardRegistry(address(proxy)).extendBillboard(0);
    }

    function test_WithdrawFunds() public {
        usdc.approve(address(proxy), initialBalance);
        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test.com");

        vm.warp(1000);
        BillboardRegistry(address(proxy)).withdrawFunds();

        uint256 expectedBalance = initialBalance;
        assertEq(usdc.balanceOf(address(this)), expectedBalance);
    }

    function test_RegisterBillboardProvider() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), securityDeposit);

        vm.expectEmit(true, true, true, true);
        emit BillboardRegistry.BillboardProviderRegistered(user, "testprovider");

        BillboardRegistry(address(proxy)).registerBillboardProvider("testprovider");
        vm.stopPrank();

        string memory handle = BillboardRegistry(address(proxy)).getBillboardProvider(user);
        assertEq(handle, "testprovider");
    }

    function test_WithdrawSecurityDeposit() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), securityDeposit);
        BillboardRegistry(address(proxy)).registerBillboardProvider("testprovider");

        uint256 initialUserBalance = usdc.balanceOf(user);

        // Try to withdraw before 30 days
        vm.expectRevert("Deposit locked for 30 days");
        BillboardRegistry(address(proxy)).withdrawSecurityDeposit();

        // Advance time by 30 days
        vm.warp(block.timestamp + 30 days);

        vm.expectEmit(true, true, true, true);
        emit BillboardRegistry.SecurityDepositWithdrawn(user, securityDeposit);

        BillboardRegistry(address(proxy)).withdrawSecurityDeposit();

        // Check balance increased by security deposit amount
        assertEq(usdc.balanceOf(user), initialUserBalance + securityDeposit);

        // Try to withdraw again
        vm.expectRevert("Deposit already withdrawn");
        BillboardRegistry(address(proxy)).withdrawSecurityDeposit();

        vm.stopPrank();
    }

    function test_GetBillboardProvider() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), securityDeposit);
        BillboardRegistry(address(proxy)).registerBillboardProvider("testprovider");
        vm.stopPrank();

        string memory handle = BillboardRegistry(address(proxy)).getBillboardProvider(user);
        assertEq(handle, "testprovider");

        // Non-registered provider should return empty string
        string memory emptyHandle = BillboardRegistry(address(proxy)).getBillboardProvider(address(0x2));
        assertEq(emptyHandle, "");
    }

    function test_RegisterBillboardProviderTwice() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), securityDeposit * 2);

        // First registration
        BillboardRegistry(address(proxy)).registerBillboardProvider("testprovider");

        // Try to register again
        vm.expectRevert("Provider already registered");
        BillboardRegistry(address(proxy)).registerBillboardProvider("newprovider");

        vm.stopPrank();
    }

    function test_RegisterWithdrawRegisterAgain() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), securityDeposit * 2);

        // First registration
        BillboardRegistry(address(proxy)).registerBillboardProvider("testprovider");

        // Advance time by 30 days
        vm.warp(block.timestamp + 30 days);

        // Withdraw security deposit
        BillboardRegistry(address(proxy)).withdrawSecurityDeposit();

        // Try to register again after withdrawal
        vm.expectRevert("Provider already registered");
        BillboardRegistry(address(proxy)).registerBillboardProvider("newprovider");

        vm.stopPrank();
    }

    function test_MultipleWithdrawalAttempts() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), securityDeposit * 2);

        // Register provider
        BillboardRegistry(address(proxy)).registerBillboardProvider("testprovider");

        // Advance time by 30 days
        vm.warp(block.timestamp + 30 days);

        // First withdrawal (should succeed)
        BillboardRegistry(address(proxy)).withdrawSecurityDeposit();

        // Second withdrawal attempt (should fail)
        vm.expectRevert("Deposit already withdrawn");
        BillboardRegistry(address(proxy)).withdrawSecurityDeposit();

        // Try to register again
        vm.expectRevert("Provider already registered");
        BillboardRegistry(address(proxy)).registerBillboardProvider("newprovider");

        vm.stopPrank();
    }
}
