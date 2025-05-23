// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./BillboardToken.sol";

contract BillboardGovernance is Initializable, OwnableUpgradeable {
    uint256 public duration;
    uint256 public pricePerBillboard;
    uint256 public securityDeposit;
    uint256 public minProposalTokens;
    uint256 public minVotingTokens;
    BillboardToken public token;
    uint256 public securityDepositAdvertiser;

    struct Proposal {
        uint256 duration;
        uint256 pricePerBillboard;
        uint256 securityDeposit;
        uint256 initialSecurityDeposit;
        uint256 minProposalTokens;
        uint256 minVotingTokens;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        address proposer;
        bool depositReturned;
        uint256 createdAt;
        uint256 securityDepositAdvertiser;
    }

    struct AdvertiserIsBlamed {
        bool isBlamed;
        uint256 createdAt;
        uint256 votesFor;
        uint256 votesAgainst;
        bool resolved;
        uint256 blameSecurityDeposit;
        bool blameSecurityDepositReturned;
        address proposer;
    }

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;
    mapping(address => mapping(uint256 => bool)) public hasVoted;
    mapping(address => AdvertiserIsBlamed) public advertiserIsBlamed;
    mapping(address => mapping(address => bool)) public hasVotedForBlame;

    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 duration,
        uint256 pricePerBillboard,
        uint256 securityDeposit,
        uint256 minProposalTokens,
        uint256 minVotingTokens,
        uint256 createdAt,
        uint256 securityDepositAdvertiser
    );
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);
    event SecurityDepositReturned(uint256 indexed proposalId, address indexed proposer, uint256 amount);
    event AdvertiserBlamed(address indexed from, address indexed advertiser);
    event VotedForBlame(address indexed voter, address indexed advertiser, bool support, uint256 votes);
    event AdvertiserBlameResolved(address indexed from, bool indexed resolved);
    event SecurityDepositReturnedForBlame(address indexed advertiser, address indexed proposer, uint256 amount);

    function updateSecurityDepositAdvertiser(uint256 _securityDepositAdvertiser) external onlyOwner {
        securityDepositAdvertiser = _securityDepositAdvertiser;
    }

    function initialize(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDeposit,
        address _token,
        uint256 _securityDepositAdvertiser,
        uint256 _minProposalTokens,
        uint256 _minVotingTokens
    ) public initializer {
        __Ownable_init(msg.sender);
        duration = _duration;
        pricePerBillboard = _pricePerBillboard;
        securityDeposit = _securityDeposit;
        minProposalTokens = _minProposalTokens;
        minVotingTokens = _minVotingTokens;
        token = BillboardToken(_token);
        proposalCount = 0;
        securityDepositAdvertiser = _securityDepositAdvertiser;
    }

    function createProposal(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDeposit,
        uint256 _minProposalTokens,
        uint256 _minVotingTokens,
        uint256 _securityDepositAdvertiser,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        require(token.balanceOf(msg.sender) >= minProposalTokens, "Insufficient tokens to create proposal");

        token.permit(msg.sender, address(this), securityDeposit, deadline, v, r, s);
        require(token.transferFrom(msg.sender, address(this), securityDeposit), "Security deposit transfer failed");

        uint256 proposalId = proposalCount;
        proposals[proposalId] = Proposal({
            duration: _duration,
            pricePerBillboard: _pricePerBillboard,
            securityDeposit: _securityDeposit,
            minProposalTokens: _minProposalTokens,
            minVotingTokens: _minVotingTokens,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            proposer: msg.sender,
            depositReturned: false,
            initialSecurityDeposit: securityDeposit,
            createdAt: block.timestamp,
            securityDepositAdvertiser: _securityDepositAdvertiser
        });

        proposalCount++;

        emit ProposalCreated(
            proposalId,
            _duration,
            _pricePerBillboard,
            _securityDeposit,
            _minProposalTokens,
            _minVotingTokens,
            block.timestamp,
            _securityDepositAdvertiser
        );
    }

    function createProposalApprove(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDeposit,
        uint256 _minProposalTokens,
        uint256 _minVotingTokens,
        uint256 _securityDepositAdvertiser
    ) external {
        require(token.balanceOf(msg.sender) >= minProposalTokens, "Insufficient tokens to create proposal");
        require(token.transferFrom(msg.sender, address(this), securityDeposit), "Security deposit transfer failed");

        uint256 proposalId = proposalCount;
        proposals[proposalId] = Proposal({
            duration: _duration,
            pricePerBillboard: _pricePerBillboard,
            securityDeposit: _securityDeposit,
            minProposalTokens: _minProposalTokens,
            minVotingTokens: _minVotingTokens,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            proposer: msg.sender,
            depositReturned: false,
            initialSecurityDeposit: securityDeposit,
            createdAt: block.timestamp,
            securityDepositAdvertiser: _securityDepositAdvertiser
        });

        proposalCount++;

        emit ProposalCreated(
            proposalId,
            _duration,
            _pricePerBillboard,
            _securityDeposit,
            _minProposalTokens,
            _minVotingTokens,
            block.timestamp,
            _securityDepositAdvertiser
        );
    }

    function vote(uint256 proposalId, bool support) external {
        require(proposalId < proposalCount, "Invalid proposal");
        require(!hasVoted[msg.sender][proposalId], "Already voted");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        uint256 amount = token.balanceOf(msg.sender);
        require(amount >= minVotingTokens, "Insufficient tokens to vote");

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
        require(proposal.createdAt + 7 days < block.timestamp, "Proposal voting not done");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not passed");

        duration = proposal.duration;
        pricePerBillboard = proposal.pricePerBillboard;
        securityDeposit = proposal.securityDeposit;
        minProposalTokens = proposal.minProposalTokens;
        minVotingTokens = proposal.minVotingTokens;
        securityDepositAdvertiser = proposal.securityDepositAdvertiser;
        proposal.executed = true;

        returnSecurityDeposit(proposalId);

        emit ProposalExecuted(proposalId);
    }

    function returnSecurityDeposit(uint256 proposalId) public {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.depositReturned, "Deposit already returned");
        require(proposal.createdAt + 7 days < block.timestamp, "Proposal voting not done");

        proposal.depositReturned = true;
        require(token.transfer(proposal.proposer, proposal.initialSecurityDeposit), "Security deposit return failed");

        emit SecurityDepositReturned(proposalId, proposal.proposer, proposal.initialSecurityDeposit);
    }

    function blameAdvertiser(address advertiser, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(token.balanceOf(msg.sender) >= minProposalTokens, "Insufficient tokens to blame advertiser");

        token.permit(msg.sender, address(this), minProposalTokens, deadline, v, r, s);
        require(token.transferFrom(msg.sender, address(this), minProposalTokens), "Token transfer failed");

        if (!advertiserIsBlamed[advertiser].isBlamed) {
            advertiserIsBlamed[advertiser] = AdvertiserIsBlamed({
                isBlamed: true,
                createdAt: block.timestamp,
                votesFor: 0,
                votesAgainst: 0,
                resolved: false,
                blameSecurityDeposit: minProposalTokens,
                blameSecurityDepositReturned: false,
                proposer: msg.sender
            });
        }

        voteForBlame(advertiser, true);
        emit AdvertiserBlamed(msg.sender, advertiser);
    }

    function blameAdvertiserApprove(address advertiser) external {
        require(token.balanceOf(msg.sender) >= minProposalTokens, "Insufficient tokens to blame advertiser");
        require(token.transferFrom(msg.sender, address(this), minProposalTokens), "Token transfer failed");

        if (!advertiserIsBlamed[advertiser].isBlamed) {
            advertiserIsBlamed[advertiser] = AdvertiserIsBlamed({
                isBlamed: true,
                createdAt: block.timestamp,
                votesFor: 0,
                votesAgainst: 0,
                resolved: false,
                blameSecurityDeposit: minProposalTokens,
                blameSecurityDepositReturned: false,
                proposer: msg.sender
            });
        }

        voteForBlame(advertiser, true);
        emit AdvertiserBlamed(msg.sender, advertiser);
    }

    function voteForBlame(address advertiser, bool support) public {
        require(advertiserIsBlamed[advertiser].isBlamed, "Advertiser is not blamed");
        require(!advertiserIsBlamed[advertiser].resolved, "Blame already resolved");
        require(!hasVotedForBlame[msg.sender][advertiser], "Already voted for this blame");

        uint256 amount = token.balanceOf(msg.sender);
        require(amount >= minVotingTokens, "Insufficient tokens to vote");

        hasVotedForBlame[msg.sender][advertiser] = true;

        if (support) {
            advertiserIsBlamed[advertiser].votesFor += amount;
        } else {
            advertiserIsBlamed[advertiser].votesAgainst += amount;
        }

        emit VotedForBlame(msg.sender, advertiser, support, amount);
    }

    function getAdvertiserIsBlamed(address advertiser) external view returns (AdvertiserIsBlamed memory) {
        return advertiserIsBlamed[advertiser];
    }

    function resolveAdvertiserBlame(address advertiser) external {
        require(advertiserIsBlamed[advertiser].isBlamed, "Advertiser is not blamed");
        require(block.timestamp > advertiserIsBlamed[advertiser].createdAt + 7 days, "Blame voting not done");
        require(!advertiserIsBlamed[advertiser].resolved, "Blame already resolved");

        bool blameResult = advertiserIsBlamed[advertiser].votesFor > advertiserIsBlamed[advertiser].votesAgainst;
        advertiserIsBlamed[advertiser].isBlamed = blameResult;
        advertiserIsBlamed[advertiser].resolved = true;

        emit AdvertiserBlameResolved(advertiser, blameResult);
    }

    function returnSecurityDepositForBlame(address advertiser) external {
        require(advertiserIsBlamed[advertiser].isBlamed, "Advertiser is not blamed");
        require(advertiserIsBlamed[advertiser].resolved, "Blame not resolved");
        require(!advertiserIsBlamed[advertiser].blameSecurityDepositReturned, "Security deposit already returned");
        require(
            token.transfer(advertiserIsBlamed[advertiser].proposer, advertiserIsBlamed[advertiser].blameSecurityDeposit),
            "Security deposit return failed"
        );
        advertiserIsBlamed[advertiser].blameSecurityDepositReturned = true;
        emit SecurityDepositReturnedForBlame(
            advertiser, advertiserIsBlamed[advertiser].proposer, advertiserIsBlamed[advertiser].blameSecurityDeposit
        );
    }

    function getProposal(uint256 proposalId)
        external
        view
        returns (
            uint256 _duration,
            uint256 _pricePerBillboard,
            uint256 _securityDeposit,
            uint256 _initialSecurityDeposit,
            uint256 _minProposalTokens,
            uint256 _minVotingTokens,
            uint256 _votesFor,
            uint256 _votesAgainst,
            bool _executed,
            uint256 _createdAt,
            uint256 _securityDepositAdvertiser
        )
    {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        return (
            proposal.duration,
            proposal.pricePerBillboard,
            proposal.securityDeposit,
            proposal.initialSecurityDeposit,
            proposal.minProposalTokens,
            proposal.minVotingTokens,
            proposal.votesFor,
            proposal.votesAgainst,
            proposal.executed,
            proposal.createdAt,
            proposal.securityDepositAdvertiser
        );
    }
}
