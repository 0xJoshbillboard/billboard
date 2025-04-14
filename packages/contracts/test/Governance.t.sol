// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BillboardGovernance} from "../src/BillboardGovernance.sol";
import {BillboardGovernanceProxy} from "../src/BillboardGovernanceProxy.sol";
import {BillboardRegistry} from "../src/BillboardRegistry.sol";
import {BillboardProxy} from "../src/BillboardProxy.sol";
import {USDCMock} from "../src/mocks/USDCMock.sol";
import {
    TransparentUpgradeableProxy,
    ITransparentUpgradeableProxy
} from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract GovernanceTest is Test {
    BillboardGovernance public governance;
    BillboardGovernanceProxy public governanceProxy;
    BillboardRegistry public registry;
    BillboardProxy public proxy;
    USDCMock public usdc;

    address public owner;
    address public user;
    uint256 public initialDuration = 30 days;
    uint256 public initialPrice = 1000e6;
    uint256 public securityDeposit = 10000e6;

    function setUp() public {
        owner = address(this);
        user = address(0x1);

        // Deploy contracts
        governance = new BillboardGovernance();
        governanceProxy = new BillboardGovernanceProxy(address(governance), owner, "");

        // Initialize governance through proxy
        BillboardGovernance(address(governanceProxy)).initialize(initialDuration, initialPrice, securityDeposit);

        // Deploy USDC mock for registry tests
        usdc = new USDCMock();

        // Deploy registry for integration tests
        registry = new BillboardRegistry();
        proxy = new BillboardProxy(address(registry), owner, "");
        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));
    }

    function test_Initialization() public {
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), initialDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), initialPrice);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), securityDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).owner(), owner);
    }

    function test_SetDuration() public {
        uint256 newDuration = 60 days;
        BillboardGovernance(address(governanceProxy)).setDuration(newDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), newDuration);
    }

    function test_SetDuration_RevertWhenNotOwner() public {
        uint256 newDuration = 60 days;
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user));
        BillboardGovernance(address(governanceProxy)).setDuration(newDuration);
    }

    function test_SetPricePerBillboard() public {
        uint256 newPrice = 2000e6;
        BillboardGovernance(address(governanceProxy)).setPricePerBillboard(newPrice);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), newPrice);
    }

    function test_SetPricePerBillboard_RevertWhenNotOwner() public {
        uint256 newPrice = 2000e6;
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user));
        BillboardGovernance(address(governanceProxy)).setPricePerBillboard(newPrice);
    }

    function test_SetSecurityDeposit() public {
        uint256 newDeposit = 20000e6;
        BillboardGovernance(address(governanceProxy)).setSecurityDeposit(newDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), newDeposit);
    }

    function test_SetSecurityDeposit_RevertWhenNotOwner() public {
        uint256 newDeposit = 20000e6;
        vm.prank(user);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", user));
        BillboardGovernance(address(governanceProxy)).setSecurityDeposit(newDeposit);
    }

    function test_RegistryIntegration_SecurityDeposit() public {
        // Mint USDC to user
        usdc.mint(user, securityDeposit);

        vm.startPrank(user);

        // Approve USDC spending
        usdc.approve(address(proxy), securityDeposit);

        // Register as billboard provider
        BillboardRegistry(address(proxy)).registerBillboardProvider("testProvider");

        // Verify provider was registered
        string memory handle = BillboardRegistry(address(proxy)).getBillboardProvider(user);
        assertEq(handle, "testProvider");

        vm.stopPrank();

        // Change security deposit
        uint256 newDeposit = 15000e6;
        BillboardGovernance(address(governanceProxy)).setSecurityDeposit(newDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), newDeposit);

        // Register another user with new deposit amount
        address user2 = address(0x2);
        usdc.mint(user2, newDeposit);

        vm.startPrank(user2);
        usdc.approve(address(proxy), newDeposit);

        // Should require the new deposit amount
        BillboardRegistry(address(proxy)).registerBillboardProvider("provider2");

        string memory handle2 = BillboardRegistry(address(proxy)).getBillboardProvider(user2);
        assertEq(handle2, "provider2");
        vm.stopPrank();
    }

    function test_UpgradeImplementation() public {
        // Deploy new implementation
        BillboardGovernance newImplementation = new BillboardGovernance();

        // Get the ProxyAdmin address
        address proxyAdmin = address(
            uint160(
                uint256(
                    vm.load(
                        address(governanceProxy), 0x10d6a54a4754c8869d6886b5f5d7fbfa5b4522237ea5c60d11bc4e7a1ff9390b
                    )
                )
            )
        );

        // Call upgradeToAndCall through the ProxyAdmin
        vm.prank(owner);
        (bool success,) = proxyAdmin.call(
            abi.encodeWithSignature(
                "upgradeAndCall(address,address,bytes)", address(governanceProxy), address(newImplementation), ""
            )
        );
        require(success, "Upgrade failed");

        // Verify the implementation was upgraded but state is preserved
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), initialDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), initialPrice);
    }

    function test_UpgradeImplementation_RevertWhenNotAdmin() public {
        // Deploy new implementation
        BillboardGovernance newImplementation = new BillboardGovernance();

        // Attempt to upgrade from non-admin account
        vm.prank(user);
        vm.expectRevert();
        ITransparentUpgradeableProxy(address(governanceProxy)).upgradeToAndCall(address(newImplementation), "");
    }

    function test_RegistryIntegration_PurchaseBillboard() public {
        // Mint USDC to user
        usdc.mint(user, initialPrice);

        vm.startPrank(user);

        // Approve USDC spending
        usdc.approve(address(proxy), initialPrice);

        // Purchase billboard
        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test-hash");

        // Verify billboard was created with correct expiry time
        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(user);
        assertEq(billboards.length, 1);
        assertEq(billboards[0].expiryTime, block.timestamp + initialDuration);

        vm.stopPrank();
    }

    function test_RegistryIntegration_DurationChange() public {
        // Mint USDC to user
        usdc.mint(user, initialPrice * 2);

        vm.startPrank(user);

        // Approve USDC spending
        usdc.approve(address(proxy), initialPrice * 2);

        // Purchase billboard
        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test-hash");

        // Verify billboard was created with correct expiry time
        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(user);
        assertEq(billboards[0].expiryTime, block.timestamp + initialDuration);

        vm.stopPrank();

        // Change duration
        uint256 newDuration = 60 days;

        // Use the owner address directly instead of the proxy address
        vm.prank(owner);
        BillboardGovernance(address(governanceProxy)).setDuration(newDuration);

        // Purchase another billboard with new duration
        vm.startPrank(user);
        BillboardRegistry(address(proxy)).purchaseBillboard("Second Billboard", "https://test2.com", "test-hash-2");

        // Verify new duration is applied
        billboards = BillboardRegistry(address(proxy)).getBillboards(user);
        assertEq(billboards[1].expiryTime, block.timestamp + newDuration);

        vm.stopPrank();
    }
}
