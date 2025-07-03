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
    uint256 public privateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    address public user2 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
    uint256 public privateKey2 = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d;
    uint256 public constant initialDuration = 30 days;
    uint256 public constant initialPrice = 1000e6;
    uint256 public constant securityDepositForProposal = 1000 * 10 ** 18;
    uint256 public constant minProposalTokens = 1000 * 10 ** 18;
    uint256 public constant minVotingTokens = 1000 * 10 ** 18;
    uint256 public constant securityDepositAdvertiser = 500 * 10 ** 6;

    function setUp() public {
        vm.createSelectFork("https://sepolia.optimism.io");

        address usdcAddress = 0x95A969D27835317179649aEF24571902c601B922;
        address billboardTokenAddress = 0x645C7c1f8FDD98967b07A2245d4AA92b920fbbA9;
        address payable governanceProxyAddress = payable(0x1875986B556048742C4597165510F19e9FDb42Fc);
        address payable proxyAddress = payable(0xeD6725010B662BccCcEC3Cb1cCe83855809c1Cc4);

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
        assertEq(BillboardGovernance(address(governanceProxy)).securityDepositForProposal(), securityDepositForProposal);
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
            "Test Billboard", "https://test.com", "test.com", true, deadline, v, r, s
        );

        BillboardRegistry.Billboard[] memory billboards = BillboardRegistry(address(proxy)).getBillboards(user);
        assertEq(billboards.length, 1);
        assertEq(billboards[0].owner, user);
        assertEq(billboards[0].expiryTime, block.timestamp + initialDuration);
        assertEq(billboards[0].description, "Test Billboard");
        assertEq(billboards[0].link, "https://test.com");
        assertEq(billboards[0].hash, "test.com");
        assertEq(billboards[0].vertical, true);
        vm.stopPrank();
    }

    function test_GovernanceProposal() public {
        vm.startPrank(user);

        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(billboardToken), 1500e6, privateKey, deadline
        );
        billboardToken.buyTokens(1500e6, deadline, v, r, s);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(billboardToken), user, address(governanceProxy), securityDepositForProposal, privateKey, deadline2
        );

        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 900 * 10 ** 18, deadline2, v2, r2, s2
        );
        vm.stopPrank();

        BillboardGovernance.Proposal memory proposal = BillboardGovernance(address(governanceProxy)).getProposal(0);

        assertEq(proposal.duration, 60 days);
        assertEq(proposal.pricePerBillboard, 2000e6);
        assertEq(proposal.securityDepositForProposal, 15000 * 10 ** 18);
        assertEq(proposal.initialSecurityDeposit, securityDepositForProposal);
        assertEq(proposal.minVotingTokens, 1500 * 10 ** 18);
        assertEq(proposal.votesFor, 0);
        assertEq(proposal.votesAgainst, 0);
        assertEq(proposal.executed, false);
        assertEq(proposal.createdAt, block.timestamp);
        assertEq(proposal.securityDepositAdvertiser, 900 * 10 ** 18);
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
            address(billboardToken), user, address(governanceProxy), securityDepositForProposal, privateKey, deadline2
        );
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 900 * 10 ** 18, deadline2, v2, r2, s2
        );
        vm.stopPrank();

        // User2 buys tokens and votes
        vm.startPrank(user2);
        uint256 deadline3 = block.timestamp + 1 hours;
        (uint8 v3, bytes32 r3, bytes32 s3) = permitSignature.getPermitSignature(
            address(usdc), user2, address(billboardToken), 5000e6, privateKey2, deadline3
        );
        billboardToken.buyTokens(5000e6, deadline3, v3, r3, s3);
        BillboardGovernance(address(governanceProxy)).vote(0, true);

        vm.stopPrank();

        // Verify votes
        BillboardGovernance.Proposal memory proposal = BillboardGovernance(address(governanceProxy)).getProposal(0);

        assertEq(proposal.votesFor, billboardToken.balanceOf(user2));
        assertEq(proposal.votesAgainst, 0);
    }

    function test_ProposalExecution() public {
        vm.startPrank(user);
        uint256 deadline = block.timestamp + 1 hours;
        (uint8 v, bytes32 r, bytes32 s) = permitSignature.getPermitSignature(
            address(usdc), user, address(billboardToken), 5000e6, privateKey, deadline
        );
        billboardToken.buyTokens(5000e6, deadline, v, r, s);

        uint256 deadline2 = block.timestamp + 1 hours;
        (uint8 v2, bytes32 r2, bytes32 s2) = permitSignature.getPermitSignature(
            address(billboardToken), user, address(governanceProxy), securityDepositForProposal, privateKey, deadline2
        );

        BillboardGovernance(address(governanceProxy)).createProposal(
            70 days, 2000e6, 15000 * 10 ** 18, 1500 * 10 ** 18, 900 * 10 ** 18, deadline2, v2, r2, s2
        );

        vm.stopPrank();

        // User2 buys tokens and votes
        vm.startPrank(user2);
        uint256 deadline3 = block.timestamp + 1 hours;
        (uint8 v3, bytes32 r3, bytes32 s3) = permitSignature.getPermitSignature(
            address(usdc), user2, address(billboardToken), 5000e6, privateKey2, deadline3
        );

        billboardToken.buyTokens(5000e6, deadline3, v3, r3, s3);
        BillboardGovernance(address(governanceProxy)).vote(0, true);
        vm.stopPrank();

        // Fast forward time
        vm.warp(block.timestamp + initialDuration + 1);

        // Execute proposal
        BillboardGovernance(address(governanceProxy)).executeProposal(0);

        BillboardGovernance.Proposal memory proposal = BillboardGovernance(address(governanceProxy)).getProposal(0);

        assertEq(proposal.executed, true);
        assertEq(proposal.securityDepositAdvertiser, 900 * 10 ** 18);
        assertEq(proposal.duration, 70 days);
        assertEq(proposal.pricePerBillboard, 2000e6);
        assertEq(proposal.securityDepositForProposal, 15000 * 10 ** 18);
        assertEq(proposal.minVotingTokens, 1500 * 10 ** 18);
    }
}
