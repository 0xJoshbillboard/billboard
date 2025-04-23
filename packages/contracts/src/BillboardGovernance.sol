// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./BillboardToken.sol";

contract BillboardGovernance is Initializable, OwnableUpgradeable {
    uint256 public duration;
    uint256 public pricePerBillboard;
    uint256 public securityDeposit;
    uint256 public votingPeriod;
    uint256 public minProposalTokens;
    uint256 public minVotingTokens;
    BillboardToken public token;

    uint256 public lastVoteTimestamp;

    struct Proposal {
        uint256 duration;
        uint256 pricePerBillboard;
        uint256 securityDeposit;
        uint256 votingPeriod;
        uint256 minProposalTokens;
        uint256 minVotingTokens;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        address proposer;
        bool depositReturned;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 duration,
        uint256 pricePerBillboard,
        uint256 securityDeposit,
        uint256 votingPeriod,
        uint256 minProposalTokens,
        uint256 minVotingTokens
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event SecurityDepositReturned(uint256 indexed proposalId, address indexed proposer, uint256 amount);

    function initialize(uint256 _duration, uint256 _pricePerBillboard, uint256 _securityDeposit, address _token)
        public
        initializer
    {
        __Ownable_init(msg.sender);
        duration = _duration;
        pricePerBillboard = _pricePerBillboard;
        securityDeposit = _securityDeposit;
        votingPeriod = 30 days;
        minProposalTokens = 1000 * 10 ** 18;
        minVotingTokens = 500 * 10 ** 18;
        token = BillboardToken(_token);
        lastVoteTimestamp = block.timestamp;
        proposalCount = 0;
    }

    function createProposal(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDeposit,
        uint256 _votingPeriod,
        uint256 _minProposalTokens,
        uint256 _minVotingTokens
    ) external {
        require(block.timestamp >= lastVoteTimestamp + votingPeriod, "Voting period not ended");
        require(token.balanceOf(msg.sender) >= minProposalTokens, "Insufficient tokens to create proposal");
        require(token.transferFrom(msg.sender, address(this), securityDeposit), "Security deposit transfer failed");

        uint256 proposalId = proposalCount;
        proposals[proposalId] = Proposal({
            duration: _duration,
            pricePerBillboard: _pricePerBillboard,
            securityDeposit: _securityDeposit,
            votingPeriod: _votingPeriod,
            minProposalTokens: _minProposalTokens,
            minVotingTokens: _minVotingTokens,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            proposer: msg.sender,
            depositReturned: false
        });

        proposalCount++;
        lastVoteTimestamp = block.timestamp;

        emit ProposalCreated(
            proposalId,
            _duration,
            _pricePerBillboard,
            _securityDeposit,
            _votingPeriod,
            _minProposalTokens,
            _minVotingTokens
        );
    }

    function vote(uint256 proposalId, bool support, uint256 amount) external {
        require(proposalId < proposalCount, "Invalid proposal");
        require(!hasVoted[msg.sender][proposalId], "Already voted");
        require(block.timestamp < lastVoteTimestamp + votingPeriod, "Voting period ended");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(token.balanceOf(msg.sender) >= minVotingTokens, "Insufficient tokens to vote");

        hasVoted[msg.sender][proposalId] = true;

        if (support) {
            proposal.votesFor += amount;
        } else {
            proposal.votesAgainst += amount;
        }

        emit Voted(proposalId, msg.sender, support, amount);
    }

    function executeProposal(uint256 proposalId) external {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(block.timestamp >= lastVoteTimestamp + votingPeriod, "Voting period not ended");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not passed");

        duration = proposal.duration;
        pricePerBillboard = proposal.pricePerBillboard;
        securityDeposit = proposal.securityDeposit;
        votingPeriod = proposal.votingPeriod;
        minProposalTokens = proposal.minProposalTokens;
        minVotingTokens = proposal.minVotingTokens;
        proposal.executed = true;

        returnSecurityDeposit(proposalId);

        emit ProposalExecuted(proposalId);
    }

    function returnSecurityDeposit(uint256 proposalId) public {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.depositReturned, "Deposit already returned");
        require(
            proposal.executed || block.timestamp >= lastVoteTimestamp + votingPeriod,
            "Proposal still active"
        );

        proposal.depositReturned = true;
        require(token.transfer(proposal.proposer, securityDeposit), "Security deposit return failed");

        emit SecurityDepositReturned(proposalId, proposal.proposer, securityDeposit);
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
            bool executed
        )
    {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.duration,
            proposal.pricePerBillboard,
            proposal.securityDeposit,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.executed
        );
    }
}
