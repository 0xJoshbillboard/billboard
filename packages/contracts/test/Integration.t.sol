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

contract IntegrationTest is Test {
    BillboardProxy public proxy;
    USDCMock public usdc;
    BillboardGovernanceProxy public governanceProxy;
    BillboardToken public billboardToken;
    PermitSignature public permitSignature;

    address public user = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
    address public user2 = address(0x2);
    uint256 public privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint256 public constant initialDuration = 30 days;
    uint256 public constant initialPrice = 1000e6;
    uint256 public constant securityDeposit = 1000 * 10 ** 6;
    uint256 public constant minProposalTokens = 1000 * 10 ** 18;
    uint256 public constant minVotingTokens = 1000 * 10 ** 18;
    uint256 public constant securityDepositAdvertiser = 500 * 10 ** 6;

    function setUp() public {
        vm.createSelectFork("https://sepolia.optimism.io");

        address usdcAddress = 0xAEe0081992ABdf6995C6196e8AE35345D2301A01;
        address billboardTokenAddress = 0xdDf9f3ACF5Fe99261aB8BB8867b322a8d245b9b3;
        address payable governanceProxyAddress = payable(0xDF570c055F7C6416B07A8D2258f1aF40EAE1A4eC);
        address payable proxyAddress = payable(0x4BfD7838f67B463a59B04e20D1DA9A36eb4855c3);

        usdc = USDCMock(usdcAddress);
        billboardToken = BillboardToken(billboardTokenAddress);
        governanceProxy = BillboardGovernanceProxy(governanceProxyAddress);
        proxy = BillboardProxy(proxyAddress);
        permitSignature = new PermitSignature();

        deal(address(usdc), user, 10000e6);
        deal(address(usdc), user2, 10000e6);
    }

    function test_Deployment() public view {
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), initialDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), initialPrice);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), securityDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).minVotingTokens(), minVotingTokens);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDepositAdvertiser(), securityDepositAdvertiser);
        assertEq(address(BillboardGovernance(address(governanceProxy)).token()), address(billboardToken));
        assertEq(address(BillboardRegistry(address(proxy)).usdc()), address(usdc));
        assertEq(address(BillboardRegistry(address(proxy)).governance()), address(governanceProxy));
    }

    function test_BillboardPurchase() public {
        vm.startPrank(user);
        vm.warp(1000);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), initialPrice, privateKey, deadline);
        BillboardRegistry(address(proxy)).purchaseBillboard(
            "Test Billboard", "https://test.com", "test.com", deadline, v, r, s
        );

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
        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;

        (uint8 v, bytes32 r, bytes32 s) =
            permitSignature.getPermitSignature(address(usdc), user, address(proxy), 50000e6, privateKey, deadline);
        billboardToken.buyTokens(50000e6, deadline, v, r, s);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minProposalTokens, privateKey, deadline2
        );

        // Create proposal
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 900 * 10 ** 18, deadline2, v2, r2, s2
        );
        vm.stopPrank();

        // Verify proposal
        (
            uint256 duration,
            uint256 price,
            uint256 deposit,
            uint256 initialSecurityDeposit,
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
        assertEq(votesFor, 0);
        assertEq(votesAgainst, 0);
        assertEq(executed, false);
        assertEq(createdAt, block.timestamp);
        assertEq(securityDepositAdvertiserFromProposal, 900 * 10 ** 18);
        assertEq(minVotingTokensFromProposal, minVotingTokens);
    }

    function test_AdvertiserRegistration() public {
        vm.startPrank(user);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(proxy), securityDepositAdvertiser, privateKey, deadline
        );
        BillboardRegistry(address(proxy)).registerBillboardAdvertiser("testprovider", deadline, v, r, s);

        BillboardRegistry.Advertiser memory advertiser = BillboardRegistry(address(proxy)).getBillboardAdvertiser(user);
        assertEq(advertiser.handle, "testprovider");
        assertEq(advertiser.advertiser, user);
        assertEq(advertiser.depositTime, block.timestamp);
        assertEq(advertiser.withdrawnDeposit, false);
        vm.stopPrank();
    }

    function test_ProposalVoting() public {
        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(billboardToken), 5000e6, privateKey, deadline
        );
        billboardToken.buyTokens(5000e6, deadline, v, r, s);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user, address(governanceProxy), minVotingTokens, privateKey, deadline2
        );
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 900 * 10 ** 18, deadline2, v2, r2, s2
        );
        vm.stopPrank();

        // User2 buys tokens and votes
        vm.startPrank(user2);
        uint256 deadline3 = block.timestamp + 1 hours;
        (uint8 v3, bytes32 r3, bytes32 s3) = permitSignature.getPermitSignature(
            address(usdc), user2, address(billboardToken), 5000e6, privateKey, deadline3
        );
        billboardToken.buyTokens(5000e6, deadline3, v3, r3, s3);
        BillboardGovernance(address(governanceProxy)).vote(1, true);

        vm.stopPrank();

        // Verify votes
        (,,,,, uint256 votesFor, uint256 votesAgainst,,,) = BillboardGovernance(address(governanceProxy)).getProposal(1);

        assertEq(votesFor, billboardToken.balanceOf(user2));
        assertEq(votesAgainst, 0);
    }

    function test_ProposalExecution() public {
        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user2, address(governanceProxy), 5000e6, privateKey, deadline
        );
        billboardToken.buyTokens(5000e6, deadline, v, r, s);

        BillboardGovernance(address(governanceProxy)).createProposal(
            70 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 900 * 10 ** 18, deadline, v, r, s
        );

        vm.stopPrank();

        // User2 buys tokens and votes
        vm.startPrank(user2);
        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(usdc), user2, address(billboardToken), 5000e6, privateKey, deadline2
        );

        billboardToken.buyTokens(5000e6, deadline2, v2, r2, s2);
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
        assertEq(minVotingTokensFromProposal, 750 * 10 ** 18);
    }
}
