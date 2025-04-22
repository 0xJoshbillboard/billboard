// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./BillboardToken.sol";

contract BillboardGovernance is Initializable, OwnableUpgradeable {
    uint256 public duration;
    uint256 public pricePerBillboard;
    uint256 public securityDeposit;
    BillboardToken public token;

    uint256 public constant VOTING_PERIOD = 30 days;
    uint256 public constant MIN_PROPOSAL_TOKENS = 1000 * 10 ** 18; // 1000 tokens with 18 decimals
    uint256 public lastVoteTimestamp;

    struct Proposal {
        uint256 duration;
        uint256 pricePerBillboard;
        uint256 securityDeposit;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        bytes32 merkleRoot;
        uint256 snapshotBlock;
    }

    Proposal[] public proposals;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(bytes32 => bool) public usedSnapshots;

    event ProposalCreated(
        uint256 indexed proposalId, uint256 duration, uint256 pricePerBillboard, uint256 securityDeposit
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);

    function initialize(uint256 _duration, uint256 _pricePerBillboard, uint256 _securityDeposit, address _token)
        public
        initializer
    {
        __Ownable_init(msg.sender);
        duration = _duration;
        pricePerBillboard = _pricePerBillboard;
        securityDeposit = _securityDeposit;
        token = BillboardToken(_token);
        lastVoteTimestamp = block.timestamp;
    }

    function createProposal(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDeposit,
        bytes32 _merkleRoot,
        uint256 _snapshotBlock,
        uint256 _proposerBalance,
        bytes32[] calldata _proposerProof
    ) external {
        require(block.timestamp >= lastVoteTimestamp + VOTING_PERIOD, "Voting period not ended");
        require(!usedSnapshots[_merkleRoot], "Snapshot already used");
        require(_proposerBalance >= MIN_PROPOSAL_TOKENS, "Insufficient tokens to create proposal");

        // Verify proposer's token balance at snapshot
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, _proposerBalance));
        require(MerkleProof.verify(_proposerProof, _merkleRoot, leaf), "Invalid proposer proof");

        proposals.push(
            Proposal({
                duration: _duration,
                pricePerBillboard: _pricePerBillboard,
                securityDeposit: _securityDeposit,
                votesFor: 0,
                votesAgainst: 0,
                executed: false,
                merkleRoot: _merkleRoot,
                snapshotBlock: _snapshotBlock
            })
        );

        usedSnapshots[_merkleRoot] = true;
        lastVoteTimestamp = block.timestamp;

        emit ProposalCreated(proposals.length - 1, _duration, _pricePerBillboard, _securityDeposit);
    }

    function vote(uint256 proposalId, bool support, uint256 amount, bytes32[] calldata proof) external {
        require(proposalId < proposals.length, "Invalid proposal");
        require(!hasVoted[msg.sender][proposalId], "Already voted");
        require(block.timestamp < lastVoteTimestamp + VOTING_PERIOD, "Voting period ended");

        Proposal storage proposal = proposals[proposalId];
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender, amount));
        require(MerkleProof.verify(proof, proposal.merkleRoot, leaf), "Invalid proof");

        hasVoted[msg.sender][proposalId] = true;

        if (support) {
            proposal.votesFor += amount;
        } else {
            proposal.votesAgainst += amount;
        }

        emit Voted(proposalId, msg.sender, support, amount);
    }

    function executeProposal(uint256 proposalId) external {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp >= lastVoteTimestamp + VOTING_PERIOD, "Voting period not ended");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not passed");

        duration = proposal.duration;
        pricePerBillboard = proposal.pricePerBillboard;
        securityDeposit = proposal.securityDeposit;
        proposal.executed = true;

        emit ProposalExecuted(proposalId);
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            uint256 _duration,
            uint256 _pricePerBillboard,
            uint256 _securityDeposit,
            uint256 votesFor,
            uint256 votesAgainst,
            bool executed,
            bytes32 merkleRoot,
            uint256 snapshotBlock
        )
    {
        require(proposalId < proposals.length, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.duration,
            proposal.pricePerBillboard,
            proposal.securityDeposit,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.executed,
            proposal.merkleRoot,
            proposal.snapshotBlock
        );
    }
}
