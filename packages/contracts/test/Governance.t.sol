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
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {PermitSignature} from "./utils/PermitSignature.sol";

contract GovernanceTest is Test {
    BillboardGovernance public governance;
    BillboardGovernanceProxy public governanceProxy;
    BillboardRegistry public registry;
    BillboardProxy public proxy;
    USDCMock public usdc;
    BillboardToken public token;
    PermitSignature public permitSignature;
    address public owner;
    address public user = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    uint256 public privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address public user2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    uint256 public initialDuration = 30 days;
    uint256 public initialPrice = 1000e6;
    uint256 public securityDeposit = 1000 * 10 ** 18;
    uint256 public minProposalTokens = 1000 * 10 ** 18;
    uint256 public minVotingTokens = 500 * 10 ** 18;
    uint256 public securityDepositAdvertiser = 1000 * 10 ** 6;

    function setUp() public {
        owner = address(this);
        permitSignature = new PermitSignature();
        usdc = new USDCMock();
        token = new BillboardToken(address(usdc));
        governance = new BillboardGovernance();
        governanceProxy = new BillboardGovernanceProxy(address(governance), owner, "");

        BillboardGovernance(address(governanceProxy)).initialize(
            initialDuration,
            initialPrice,
            securityDeposit,
            address(token),
            securityDepositAdvertiser,
            minProposalTokens,
            minVotingTokens
        );

        registry = new BillboardRegistry();
        proxy = new BillboardProxy(address(registry), owner, "");
        BillboardRegistry(address(proxy)).initialize(address(usdc), address(governanceProxy));

        usdc.mint(user, 500_000e6);
        usdc.mint(user2, 500_000e6);
        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(token), usdc.balanceOf(user), privateKey, deadline
        );
        token.buyTokens(usdc.balanceOf(user), deadline, v, r, s);
        vm.stopPrank();
        vm.startPrank(user2);
        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user2, address(token), usdc.balanceOf(user2), privateKey, deadline2
        );
        token.buyTokens(usdc.balanceOf(user2), deadline2, v2, r2, s2);
        vm.stopPrank();
    }

    function test_Initialization() public view {
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), initialDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), initialPrice);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), securityDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).owner(), owner);
        assertEq(BillboardGovernance(address(governanceProxy)).minProposalTokens(), 1000 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).minVotingTokens(), 500 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDepositAdvertiser(), securityDepositAdvertiser);
        assertEq(address(BillboardGovernance(address(governanceProxy)).token()), address(token));
        assertEq(BillboardGovernance(address(governanceProxy)).proposalCount(), 0);
    }

    function test_CreateProposal_WithSufficientTokens() public {
        vm.startPrank(user);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline
        );

        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 900 * 10 ** 18, deadline, v, r, s
        );
        vm.stopPrank();

        (
            uint256 duration,
            uint256 price,
            uint256 deposit,
            uint256 initialSecurityDeposit,
            uint256 minProposalTokensFromProposal,
            uint256 minVotingTokensFromProposal,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed,
            uint256 createdAt,
            uint256 securityDepositAdvertiserFromProposal
        ) = BillboardGovernance(address(governanceProxy)).getProposal(0);

        assertEq(duration, 60 days);
        assertEq(price, 2000e6);
        assertEq(deposit, 15000 * 10 ** 18);
        assertEq(initialSecurityDeposit, 1000 * 10 ** 18);
        assertEq(minProposalTokensFromProposal, 1500 * 10 ** 18);
        assertEq(minVotingTokensFromProposal, 750 * 10 ** 18);
        assertEq(votesFor, 0);
        assertEq(votesAgainst, 0);
        assertEq(executed, false);
        assertEq(createdAt, block.timestamp);
        assertEq(securityDepositAdvertiserFromProposal, 900 * 10 ** 18);
    }

    function test_CreateProposal_RevertWhenInsufficientTokens() public {
        vm.startPrank(user2);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user2, address(governanceProxy), minProposalTokens, privateKey, deadline
        );
        vm.expectRevert("Insufficient tokens to create proposal");
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 900 * 10 ** 18, deadline, v, r, s
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
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(token), user1UsdcAmount, privateKey, deadline
        );
        token.buyTokens(user1UsdcAmount, deadline, v, r, s);
        vm.stopPrank();

        vm.startPrank(user2);
        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user2, address(token), user2UsdcAmount, privateKey, deadline2
        );

        token.buyTokens(user2UsdcAmount, deadline2, v2, r2, s2);
        vm.stopPrank();

        vm.startPrank(user);

        uint256 deadline3 = block.timestamp + 1 hours;
        (uint8 v3, bytes32 r3, bytes32 s3) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline3
        );
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 900 * 10 ** 18, deadline3, v3, r3, s3
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true);
        vm.stopPrank();

        (,,,,,, uint256 votesFor, uint256 votesAgainst, bool executed,,) =
            BillboardGovernance(address(governanceProxy)).getProposal(0);
        assertEq(votesFor, user2BbtAmount);
        assertEq(votesAgainst, 0);
        assertEq(executed, false);
    }

    function test_ExecuteProposal() public {
        uint256 user1UsdcAmount = 50000e6; // Increased amount to ensure enough BBT tokens
        uint256 user2UsdcAmount = 20000e6; // Increased amount to ensure enough BBT tokens

        usdc.mint(user, user1UsdcAmount);
        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(token), user1UsdcAmount, privateKey, deadline
        );
        token.buyTokens(user1UsdcAmount, deadline, v, r, s);
        vm.stopPrank();

        vm.startPrank(user2);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user2, address(token), user2UsdcAmount, privateKey, deadline2
        );
        token.buyTokens(user2UsdcAmount, deadline2, v2, r2, s2);
        vm.stopPrank();

        vm.startPrank(user);

        uint256 deadline3 = block.timestamp + 1 hours;
        (uint8 v3, bytes32 r3, bytes32 s3) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline3
        );

        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 800 * 10 ** 18, deadline3, v3, r3, s3
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true);
        vm.stopPrank();

        vm.warp(block.timestamp + 30 days + 1);

        BillboardGovernance(address(governanceProxy)).executeProposal(0);

        assertEq(BillboardGovernance(address(governanceProxy)).duration(), 60 days);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), 2000e6);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), 15000 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).minProposalTokens(), 1500 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).minVotingTokens(), 750 * 10 ** 18);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDepositAdvertiser(), 800 * 10 ** 18);

        (,,,,,,,, bool _executed,,) = BillboardGovernance(address(governanceProxy)).getProposal(0);
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

        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user2);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user2, address(token), user2UsdcAmount, privateKey, deadline
        );
        token.buyTokens(user2UsdcAmount, deadline, v, r, s);
        vm.stopPrank();

        vm.startPrank(user);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline2
        );
        uint256 initialBalance = token.balanceOf(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 800 * 10 ** 18, deadline2, v2, r2, s2
        );
        assertEq(token.balanceOf(user), initialBalance - securityDeposit);
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true);
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
        uint256 user1UsdcAmount = 50000e6;
        uint256 user2UsdcAmount = 20000e6;

        usdc.mint(user, user1UsdcAmount);
        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(token), user1UsdcAmount, privateKey, deadline
        );
        token.buyTokens(user1UsdcAmount, deadline, v, r, s);
        vm.stopPrank();

        vm.startPrank(user2);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user2, address(token), user2UsdcAmount, privateKey, deadline2
        );
        token.buyTokens(user2UsdcAmount, deadline2, v2, r2, s2);
        vm.stopPrank();

        vm.startPrank(user);

        uint256 deadline3 = block.timestamp + 1 hours;
        (uint8 v3, bytes32 r3, bytes32 s3) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline3
        );
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 800 * 10 ** 18, deadline3, v3, r3, s3
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(0, true);
        vm.stopPrank();

        vm.warp(block.timestamp + 30 days + 1);

        BillboardGovernance(address(governanceProxy)).executeProposal(0);
        vm.expectRevert("Deposit already returned");
        BillboardGovernance(address(governanceProxy)).returnSecurityDeposit(0);
    }

    function test_blameAdvertiser() public {
        usdc.mint(user2, 1000 * 10 ** 6);
        vm.startPrank(user2);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user2, address(proxy), 1000 * 10 ** 6, privateKey, deadline
        );
        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);
        vm.stopPrank();

        vm.startPrank(user);
        token.approve(address(governanceProxy), 1000 * 10 ** 18);
        vm.expectEmit(true, true, true, true);
        emit BillboardGovernance.AdvertiserBlamed(user, user2);
        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline2
        );
        BillboardGovernance(address(governanceProxy)).blameAdvertiser(user2, deadline2, v2, r2, s2);
        vm.stopPrank();

        BillboardGovernance.AdvertiserIsBlamed memory advertiserIsBlamed =
            BillboardGovernance(address(governanceProxy)).getAdvertiserIsBlamed(user2);

        assertEq(advertiserIsBlamed.isBlamed, true);
        assertEq(advertiserIsBlamed.createdAt, block.timestamp);
        assertEq(advertiserIsBlamed.resolved, false);
        assertEq(advertiserIsBlamed.votesFor, token.balanceOf(user));
        assertEq(advertiserIsBlamed.votesAgainst, 0);

        vm.warp(block.timestamp + 30 days + 1);

        vm.expectRevert("Advertiser is blamed");
        vm.startPrank(user2);
        BillboardRegistry(address(proxy)).withdrawSecurityDepositForAdvertiser();
        vm.stopPrank();

        vm.expectEmit(true, true, true, true);
        emit BillboardGovernance.AdvertiserBlameResolved(user2, true);
        BillboardGovernance(address(governanceProxy)).resolveAdvertiserBlame(user2);

        BillboardGovernance.AdvertiserIsBlamed memory advertiserIsBlamedAfterBeingResolved =
            BillboardGovernance(address(governanceProxy)).getAdvertiserIsBlamed(user2);

        vm.expectEmit(true, true, true, true);
        emit IERC20.Transfer(address(governanceProxy), user, minProposalTokens);
        BillboardGovernance(address(governanceProxy)).returnSecurityDepositForBlame(user2);

        assertEq(advertiserIsBlamedAfterBeingResolved.resolved, true);
        assertEq(token.balanceOf(user), 5000e18);
        assertEq(usdc.balanceOf(address(governanceProxy)), 0);
    }

    function test_blameAdvertiser_RevertWhenNotResolved() public {
        usdc.mint(user2, 1000 * 10 ** 6);
        vm.startPrank(user2);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user2, address(proxy), 1000 * 10 ** 6, privateKey, deadline
        );
        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);
        vm.stopPrank();

        vm.startPrank(user);
        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline2
        );
        BillboardGovernance(address(governanceProxy)).blameAdvertiser(user2, deadline2, v2, r2, s2);
        vm.stopPrank();

        vm.expectRevert("Blame not resolved");
        BillboardGovernance(address(governanceProxy)).returnSecurityDepositForBlame(user2);
    }
}
