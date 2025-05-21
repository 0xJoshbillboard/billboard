// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test, console} from "forge-std/Test.sol";
import {BillboardRegistry} from "../src/BillboardRegistry.sol";
import {BillboardProxy} from "../src/BillboardProxy.sol";
import {USDCMock} from "../src/mocks/USDCMock.sol";
import {BillboardGovernance} from "../src/BillboardGovernance.sol";
import {BillboardGovernanceProxy} from "../src/BillboardGovernanceProxy.sol";
import {BillboardToken} from "../src/BillboardToken.sol";

contract IntegrationTest is Test {
    BillboardRegistry public registry;
    BillboardProxy public proxy;
    USDCMock public usdc;
    BillboardGovernance public governance;
    BillboardGovernanceProxy public governanceProxy;
    BillboardToken public billboardToken;

    address public user;
    address public user2;
    uint256 public constant initialDuration = 30 days;
    uint256 public constant initialPrice = 1000e6;
    uint256 public constant securityDeposit = 1000 * 10 ** 6;
    uint256 public constant minProposalTokens = 1000 * 10 ** 18;
    uint256 public constant minVotingTokens = 1000 * 10 ** 18;
    uint256 public constant securityDepositAdvertiser = 500 * 10 ** 6;

    function setUp() public {
        // Fork optimism-sepolia
        vm.createSelectFork("https://sepolia.optimism.io");

        user = address(0x1);
        user2 = address(0x2);

        // Use hardcoded contract addresses
        address usdcAddress = 0xe17612de297d7a6aC3C8af568a556b62D1f2074c;
        address billboardTokenAddress = 0xC6532522Fa6C05533047c17896EA56D41A2e127F;
        address governanceAddress = 0xd6567E7d5fef1255a49b913bAa13896238a0305e;
        address payable governanceProxyAddress = payable(0x9527F41eb97173EA364B775b4AB99578110fec5f);
        address registryAddress = 0x7157e940556150f0aD3316b3F86618E2C709A5d5;
        address payable proxyAddress = payable(0xC5533B322861dE8c894Fc44EC421A02395b83Df5);

        // Initialize contract instances
        usdc = USDCMock(usdcAddress);
        billboardToken = BillboardToken(billboardTokenAddress);
        governance = BillboardGovernance(governanceAddress);
        governanceProxy = BillboardGovernanceProxy(governanceProxyAddress);
        registry = BillboardRegistry(registryAddress);
        proxy = BillboardProxy(proxyAddress);

        // Mint USDC to users
        deal(address(usdc), user, 10000e6);
        deal(address(usdc), user2, 10000e6);
    }

    function test_Deployment() public view {
        // Verify governance proxy initialization
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), initialDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), initialPrice);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), securityDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).minProposalTokens(), minProposalTokens);
        assertEq(BillboardGovernance(address(governanceProxy)).minVotingTokens(), minVotingTokens);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDepositAdvertiser(), securityDepositAdvertiser);
        assertEq(address(BillboardGovernance(address(governanceProxy)).token()), address(billboardToken));

        // Verify registry initialization
        assertEq(address(BillboardRegistry(address(proxy)).usdc()), address(usdc));
        assertEq(address(BillboardRegistry(address(proxy)).governance()), address(governanceProxy));
    }

    function test_BillboardPurchase() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), initialPrice);

        BillboardRegistry(address(proxy)).purchaseBillboard("Test Billboard", "https://test.com", "test.com");

        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(user);
        assertEq(billboards.length, 1);
        assertEq(billboards[0].owner, user);
        assertEq(billboards[0].expiryTime, block.timestamp + initialDuration);
        assertEq(billboards[0].description, "Test Billboard");
        assertEq(billboards[0].link, "https://test.com");
        assertEq(billboards[0].hash, "test.com");
        vm.stopPrank();
    }

    function test_GovernanceProposal() public {
        // Buy tokens for user
        vm.startPrank(user);
        usdc.approve(address(billboardToken), 5000e6);
        billboardToken.buyTokens(5000e6);
        billboardToken.approve(address(governanceProxy), minProposalTokens);

        // Create proposal
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 900 * 10 ** 18
        );
        vm.stopPrank();

        // Verify proposal
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
        ) = BillboardGovernance(address(governanceProxy)).getProposal(1);

        assertEq(duration, 60 days);
        assertEq(price, 2000e6);
        assertEq(deposit, 15000 * 10 ** 18);
        assertEq(initialSecurityDeposit, securityDeposit);
        assertEq(minProposalTokensFromProposal, 1500 * 10 ** 18);
        assertEq(minVotingTokensFromProposal, 750 * 10 ** 18);
        assertEq(votesFor, 0);
        assertEq(votesAgainst, 0);
        assertEq(executed, false);
        assertEq(createdAt, block.timestamp);
        assertEq(securityDepositAdvertiserFromProposal, 900 * 10 ** 18);
    }

    function test_AdvertiserRegistration() public {
        vm.startPrank(user);
        usdc.approve(address(proxy), securityDepositAdvertiser);

        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider");

        BillboardRegistry.Advertiser memory advertiser = BillboardRegistry(address(proxy)).getBillboardAdvertiser(user);
        assertEq(advertiser.handle, "testprovider");
        assertEq(advertiser.advertiser, user);
        assertEq(advertiser.depositTime, block.timestamp);
        assertEq(advertiser.withdrawnDeposit, false);
        vm.stopPrank();
    }

    function test_ProposalVoting() public {
        // Setup users with tokens
        vm.startPrank(user);
        usdc.approve(address(billboardToken), 5000e6);
        billboardToken.buyTokens(5000e6);
        billboardToken.approve(address(governanceProxy), minProposalTokens);

        // Create proposal
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 900 * 10 ** 18
        );
        vm.stopPrank();

        // User2 buys tokens and votes
        vm.startPrank(user2);
        usdc.approve(address(billboardToken), 5000e6);
        billboardToken.buyTokens(5000e6);
        billboardToken.approve(address(governanceProxy), minVotingTokens);
        BillboardGovernance(address(governanceProxy)).vote(1, true);
        vm.stopPrank();

        // Verify votes
        (,,,,,, uint256 votesFor, uint256 votesAgainst,,,) =
            BillboardGovernance(address(governanceProxy)).getProposal(1);

        assertEq(votesFor, billboardToken.balanceOf(user2));
        assertEq(votesAgainst, 0);
    }

    function test_ProposalExecution() public {
        // Setup users with tokens
        vm.startPrank(user);
        usdc.approve(address(billboardToken), 5000e6);
        billboardToken.buyTokens(5000e6);
        billboardToken.approve(address(governanceProxy), minProposalTokens);

        // Create proposal
        BillboardGovernance(address(governanceProxy)).createProposal(
            70 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 750 * 10 ** 18, 900 * 10 ** 18
        );
        vm.stopPrank();

        // User2 buys tokens and votes
        vm.startPrank(user2);
        usdc.approve(address(billboardToken), 5000e6);
        billboardToken.buyTokens(5000e6);
        billboardToken.approve(address(governanceProxy), minVotingTokens);
        BillboardGovernance(address(governanceProxy)).vote(1, true);
        vm.stopPrank();

        // Fast forward time
        vm.warp(block.timestamp + initialDuration + 1);

        // Execute proposal
        BillboardGovernance(address(governanceProxy)).executeProposal(1);

        (
            uint256 duration,
            uint256 pricePerBillboard,
            uint256 securityDepositFromProposal,
            ,
            uint256 minProposalTokensFromProposal,
            uint256 minVotingTokensFromProposal,
            ,
            ,
            bool executed,
            ,
            uint256 securityDepositAdvertiserFromProposal
        ) = BillboardGovernance(address(governanceProxy)).getProposal(1);

        assertEq(executed, true);
        assertEq(securityDepositAdvertiserFromProposal, 900 * 10 ** 18);
        assertEq(duration, 70 days);
        assertEq(pricePerBillboard, 2000e6);
        assertEq(securityDepositFromProposal, 15000 * 10 ** 18);
        assertEq(minProposalTokensFromProposal, 1500 * 10 ** 18);
        assertEq(minVotingTokensFromProposal, 750 * 10 ** 18);
    }
}
