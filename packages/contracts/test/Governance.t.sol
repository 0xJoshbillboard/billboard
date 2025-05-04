// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BillboardGovernance} from "../src/BillboardGovernance.sol";
import {BillboardGovernanceProxy} from "../src/BillboardGovernanceProxy.sol";
import {BillboardRegistry} from "../src/BillboardRegistry.sol";
import {BillboardProxy} from "../src/BillboardProxy.sol";
import {USDCMock} from "../src/mocks/USDCMock.sol";
import {BillboardToken} from "../src/BillboardToken.sol";
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
    BillboardToken public token;

    address public owner;
    address public user;
    address public user2;
    uint256 public initialDuration = 30 days;
    uint256 public initialPrice = 1000e6;
    uint256 public securityDeposit = 1000 * 10 ** 18;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        user2 = address(0x2);

        usdc = new USDCMock();
        token = new BillboardToken(address(usdc));

        governance = new BillboardGovernance();
        governanceProxy = new BillboardGovernanceProxy(address(governance), owner, "");

        BillboardGovernance(address(governanceProxy)).initialize(
            initialDuration, initialPrice, securityDeposit, address(token)
        );

        registry = new BillboardRegistry();
        proxy = new BillboardProxy(address(registry), owner, "");
        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));

        usdc.mint(user, 10_0000e6);
        vm.startPrank(user);
        usdc.approve(address(token), 10_0000e6);
        token.buyTokens(10_0000e6);
        vm.stopPrank();
    }

    function test_Initialization() public view {
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), initialDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), initialPrice);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), securityDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).owner(), owner);
        assertEq(BillboardGovernance(address(governanceProxy)).minProposalTokens(), 1000 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).minVotingTokens(), 500 * 10 ** 18);
    }

    function test_CreateProposal_WithSufficientTokens() public {
        vm.startPrank(user);
        token.approve(address(governanceProxy), 1000 * 10 ** 18);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18
        );
        vm.stopPrank();

        (
            uint256 duration,
            uint256 price,
            uint256 deposit,
            uint256 initialSecurityDeposit,
            uint256 minProposalTokens,
            uint256 minVotingTokens,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed,
        ) = BillboardGovernance(address(governanceProxy)).getProposal(0);

        assertEq(duration, 60 days);
        assertEq(price, 2000e6);
        assertEq(deposit, 15000 * 10 ** 18);
        assertEq(initialSecurityDeposit, 1000 * 10 ** 18);
        assertEq(minProposalTokens, 1500 * 10 ** 18);
        assertEq(minVotingTokens, 750 * 10 ** 18);
        assertEq(votesFor, 0);
        assertEq(votesAgainst, 0);
        assertEq(executed, false);
    }

    function test_CreateProposal_RevertWhenInsufficientTokens() public {
        vm.startPrank(user2);
        token.approve(address(governanceProxy), 1000 * 10 ** 18);
        vm.expectRevert("Insufficient tokens to create proposal");
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18
        );
        vm.stopPrank();
    }

    function test_VoteOnProposal() public {
        uint256 user1UsdcAmount = 2000e6;
        uint256 user2UsdcAmount = 1000e6;
        uint256 user1BbtAmount = user1UsdcAmount * 10 ** 12;
        uint256 user2BbtAmount = user2UsdcAmount * 10 ** 12;

        usdc.mint(user, user1UsdcAmount);
        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user);
        usdc.approve(address(token), user1UsdcAmount);
        token.buyTokens(user1UsdcAmount);
        token.approve(address(governanceProxy), user1BbtAmount);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(token), user2UsdcAmount);
        token.buyTokens(user2UsdcAmount);
        token.approve(address(governanceProxy), user2BbtAmount);
        vm.stopPrank();

        vm.startPrank(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true, user2BbtAmount);
        vm.stopPrank();

        (,,,,,, uint256 votesFor, uint256 votesAgainst,,) = BillboardGovernance(address(governanceProxy)).getProposal(0);
        assertEq(votesFor, user2BbtAmount);
        assertEq(votesAgainst, 0);
    }

    function test_ExecuteProposal() public {
        uint256 user1UsdcAmount = 50000e6; // Increased amount to ensure enough BBT tokens
        uint256 user2UsdcAmount = 20000e6; // Increased amount to ensure enough BBT tokens
        uint256 user1BbtAmount = user1UsdcAmount * 10 ** 12; // Convert to BBT decimals (18)
        uint256 user2BbtAmount = user2UsdcAmount * 10 ** 12; // Convert to BBT decimals (18)

        usdc.mint(user, user1UsdcAmount);
        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user);
        usdc.approve(address(token), user1UsdcAmount);
        token.buyTokens(user1UsdcAmount);
        token.approve(address(governanceProxy), user1BbtAmount);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(token), user2UsdcAmount);
        token.buyTokens(user2UsdcAmount);
        token.approve(address(governanceProxy), user2BbtAmount);
        vm.stopPrank();

        vm.startPrank(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true, user2BbtAmount);
        vm.stopPrank();

        vm.warp(block.timestamp + 30 days + 1);

        BillboardGovernance(address(governanceProxy)).executeProposal(0);

        assertEq(BillboardGovernance(address(governanceProxy)).duration(), 60 days);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), 2000e6);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), 15000 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).minProposalTokens(), 1500 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).minVotingTokens(), 750 * 10 ** 18);

        (,,,,,,,, bool _executed,) = BillboardGovernance(address(governanceProxy)).getProposal(0);
        assertEq(_executed, true);
    }

    function test_ExecuteProposal_RevertWhenVotingPeriodNotEnded() public {
        test_CreateProposal_WithSufficientTokens();

        vm.expectRevert("Proposal voting not done");
        BillboardGovernance(address(governanceProxy)).executeProposal(0);
    }

    function test_ExecuteProposal_RevertWhenNotPassed() public {
        test_CreateProposal_WithSufficientTokens();

        vm.warp(block.timestamp + 30 days + 1);

        vm.expectRevert("Proposal not passed");
        BillboardGovernance(address(governanceProxy)).executeProposal(0);
    }

    function test_ReturnSecurityDeposit_AfterExecution() public {
        uint256 user2UsdcAmount = 20000e6;
        uint256 user2BbtAmount = user2UsdcAmount * 10 ** 12;

        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user2);
        usdc.approve(address(token), user2UsdcAmount);
        token.buyTokens(user2UsdcAmount);
        token.approve(address(governanceProxy), user2BbtAmount);
        vm.stopPrank();

        vm.startPrank(user);
        token.approve(address(governanceProxy), 1000 * 10 ** 18);
        uint256 initialBalance = token.balanceOf(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18
        );
        assertEq(token.balanceOf(user), initialBalance - securityDeposit);
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true, user2BbtAmount);
        vm.stopPrank();

        vm.warp(block.timestamp + 30 days + 1);

        BillboardGovernance(address(governanceProxy)).executeProposal(0);
        assertEq(token.balanceOf(user), initialBalance);

        vm.expectRevert("Deposit already returned");
        BillboardGovernance(address(governanceProxy)).returnSecurityDeposit(0);
    }

    function test_ReturnSecurityDeposit_AfterVotingPeriod() public {
        test_CreateProposal_WithSufficientTokens();

        vm.warp(block.timestamp + 30 days + 1);

        uint256 initialBalance = token.balanceOf(user);
        BillboardGovernance(address(governanceProxy)).returnSecurityDeposit(0);
        assertEq(token.balanceOf(user), initialBalance + securityDeposit);
    }

    function test_ReturnSecurityDeposit_RevertWhenStillActive() public {
        test_CreateProposal_WithSufficientTokens();

        vm.expectRevert("Proposal voting not done");
        BillboardGovernance(address(governanceProxy)).returnSecurityDeposit(0);
    }

    function test_ReturnSecurityDeposit_RevertWhenAlreadyReturned() public {
        uint256 user1UsdcAmount = 50000e6; // Increased amount to ensure enough BBT tokens
        uint256 user2UsdcAmount = 20000e6; // Increased amount to ensure enough BBT tokens
        uint256 user1BbtAmount = user1UsdcAmount * 10 ** 12; // Convert to BBT decimals (18)
        uint256 user2BbtAmount = user2UsdcAmount * 10 ** 12; // Convert to BBT decimals (18)

        usdc.mint(user, user1UsdcAmount);
        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user);
        usdc.approve(address(token), user1UsdcAmount);
        token.buyTokens(user1UsdcAmount);
        token.approve(address(governanceProxy), user1BbtAmount);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(token), user2UsdcAmount);
        token.buyTokens(user2UsdcAmount);
        token.approve(address(governanceProxy), user2BbtAmount);
        vm.stopPrank();

        vm.startPrank(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true, user2BbtAmount);
        vm.stopPrank();

        vm.warp(block.timestamp + 30 days + 1);

        BillboardGovernance(address(governanceProxy)).executeProposal(0);
        vm.expectRevert("Deposit already returned");
        BillboardGovernance(address(governanceProxy)).returnSecurityDeposit(0);
    }
}
