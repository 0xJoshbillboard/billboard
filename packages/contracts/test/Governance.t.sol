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
    uint256 public securityDeposit = 10000e6;

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

        vm.warp(block.timestamp + 30 days + 1);
    }

    function test_Initialization() public view {
        assertEq(BillboardGovernance(address(governanceProxy)).duration(), initialDuration);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), initialPrice);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), securityDeposit);
        assertEq(BillboardGovernance(address(governanceProxy)).owner(), owner);
    }

    function test_CreateProposal_WithSufficientTokens() public {
        uint256 usdcAmount = 2000e6;
        uint256 expectedBbtAmount = usdcAmount * 10 ** 12;
        usdc.mint(user, usdcAmount);
        vm.startPrank(user);
        usdc.approve(address(token), usdcAmount);
        token.buyTokens(usdcAmount);
        vm.stopPrank();

        bytes32[] memory leaves = new bytes32[](1);
        leaves[0] = keccak256(abi.encodePacked(user, expectedBbtAmount));
        bytes32 merkleRoot = getMerkleRoot(leaves);

        vm.startPrank(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000e6, merkleRoot, block.number, expectedBbtAmount, getMerkleProof(leaves, 0)
        );
        vm.stopPrank();

        (
            uint256 duration,
            uint256 price,
            uint256 deposit,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed,
            bytes32 root,
            uint256 snapshotBlock
        ) = BillboardGovernance(address(governanceProxy)).getProposal(0);

        assertEq(duration, 60 days);
        assertEq(price, 2000e6);
        assertEq(deposit, 15000e6);
        assertEq(votesFor, 0);
        assertEq(votesAgainst, 0);
        assertEq(executed, false);
        assertEq(root, merkleRoot);
        assertEq(snapshotBlock, block.number);
    }

    function test_CreateProposal_RevertWhenInsufficientTokens() public {
        uint256 usdcAmount = 500e6;
        uint256 expectedBbtAmount = usdcAmount * 10 ** 12;
        usdc.mint(user, usdcAmount);
        vm.startPrank(user);
        usdc.approve(address(token), usdcAmount);
        token.buyTokens(usdcAmount);
        vm.stopPrank();

        bytes32[] memory leaves = new bytes32[](1);
        leaves[0] = keccak256(abi.encodePacked(user, expectedBbtAmount));
        bytes32 merkleRoot = getMerkleRoot(leaves);

        vm.startPrank(user);
        vm.expectRevert("Insufficient tokens to create proposal");
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000e6, merkleRoot, block.number, expectedBbtAmount, getMerkleProof(leaves, 0)
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
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(token), user2UsdcAmount);
        token.buyTokens(user2UsdcAmount);
        vm.stopPrank();

        bytes32[] memory leaves = new bytes32[](2);
        leaves[0] = keccak256(abi.encodePacked(user, user1BbtAmount));
        leaves[1] = keccak256(abi.encodePacked(user2, user2BbtAmount));
        bytes32 merkleRoot = getMerkleRoot(leaves);

        vm.startPrank(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000e6, merkleRoot, block.number, user1BbtAmount, getMerkleProof(leaves, 0)
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(
            0, true, user2BbtAmount, getMerkleProof(leaves, 1)
        );
        vm.stopPrank();

        (,,, uint256 votesFor, uint256 votesAgainst,,,) = BillboardGovernance(address(governanceProxy)).getProposal(0);
        assertEq(votesFor, user2BbtAmount);
        assertEq(votesAgainst, 0);
    }

    function test_ExecuteProposal() public {
        uint256 user1UsdcAmount = 2000e6;
        uint256 user2UsdcAmount = 1000e6;
        uint256 user1BbtAmount = user1UsdcAmount * 10 ** 12;
        uint256 user2BbtAmount = user2UsdcAmount * 10 ** 12;

        usdc.mint(user, user1UsdcAmount);
        usdc.mint(user2, user2UsdcAmount);

        vm.startPrank(user);
        usdc.approve(address(token), user1UsdcAmount);
        token.buyTokens(user1UsdcAmount);
        vm.stopPrank();

        vm.startPrank(user2);
        usdc.approve(address(token), user2UsdcAmount);
        token.buyTokens(user2UsdcAmount);
        vm.stopPrank();

        bytes32[] memory leaves = new bytes32[](2);
        leaves[0] = keccak256(abi.encodePacked(user, user1BbtAmount));
        leaves[1] = keccak256(abi.encodePacked(user2, user2BbtAmount));
        bytes32 merkleRoot = getMerkleRoot(leaves);

        vm.startPrank(user);
        BillboardGovernance(address(governanceProxy)).createProposal(
            60 days, 2000e6, 15000e6, merkleRoot, block.number, user1BbtAmount, getMerkleProof(leaves, 0)
        );
        vm.stopPrank();

        vm.startPrank(user2);
        BillboardGovernance(address(governanceProxy)).vote(
            0, true, user2BbtAmount, getMerkleProof(leaves, 1)
        );
        vm.stopPrank();

        vm.warp(block.timestamp + 30 days + 1);

        BillboardGovernance(address(governanceProxy)).executeProposal(0);

        assertEq(BillboardGovernance(address(governanceProxy)).duration(), 60 days);
        assertEq(BillboardGovernance(address(governanceProxy)).pricePerBillboard(), 2000e6);
        assertEq(BillboardGovernance(address(governanceProxy)).securityDeposit(), 15000e6);

        (,,,,, bool executed,,) = BillboardGovernance(address(governanceProxy)).getProposal(0);
        assertEq(executed, true);
    }

    function test_ExecuteProposal_RevertWhenVotingPeriodNotEnded() public {
        test_CreateProposal_WithSufficientTokens();

        vm.expectRevert("Voting period not ended");
        BillboardGovernance(address(governanceProxy)).executeProposal(0);
    }

    function test_ExecuteProposal_RevertWhenNotPassed() public {
        test_CreateProposal_WithSufficientTokens();

        vm.warp(block.timestamp + 30 days + 1);

        vm.expectRevert("Proposal not passed");
        BillboardGovernance(address(governanceProxy)).executeProposal(0);
    }

    function getMerkleRoot(bytes32[] memory leaves) internal pure returns (bytes32) {
        if (leaves.length == 0) return bytes32(0);
        if (leaves.length == 1) return leaves[0];

        bytes32[] memory nodes = leaves;
        while (nodes.length > 1) {
            bytes32[] memory newNodes = new bytes32[]((nodes.length + 1) / 2);
            for (uint256 i = 0; i < nodes.length; i += 2) {
                if (i + 1 < nodes.length) {
                    newNodes[i / 2] = keccak256(abi.encodePacked(nodes[i], nodes[i + 1]));
                } else {
                    newNodes[i / 2] = nodes[i];
                }
            }
            nodes = newNodes;
        }
        return nodes[0];
    }

    function getMerkleProof(bytes32[] memory leaves, uint256 index) internal pure returns (bytes32[] memory) {
        require(index < leaves.length, "Index out of bounds");

        bytes32[] memory proof = new bytes32[](32);
        uint256 proofLength = 0;

        bytes32[] memory nodes = leaves;
        uint256 currentIndex = index;

        while (nodes.length > 1) {
            if (currentIndex % 2 == 1) {
                proof[proofLength++] = nodes[currentIndex - 1];
            } else if (currentIndex + 1 < nodes.length) {
                proof[proofLength++] = nodes[currentIndex + 1];
            }

            bytes32[] memory newNodes = new bytes32[]((nodes.length + 1) / 2);
            for (uint256 i = 0; i < nodes.length; i += 2) {
                if (i + 1 < nodes.length) {
                    newNodes[i / 2] = keccak256(abi.encodePacked(nodes[i], nodes[i + 1]));
                } else {
                    newNodes[i / 2] = nodes[i];
                }
            }
            nodes = newNodes;
            currentIndex = currentIndex / 2;
        }

        bytes32[] memory trimmedProof = new bytes32[](proofLength);
        for (uint256 i = 0; i < proofLength; i++) {
            trimmedProof[i] = proof[i];
        }

        return trimmedProof;
    }
}
