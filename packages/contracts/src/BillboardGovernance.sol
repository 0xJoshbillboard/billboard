// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "./BillboardToken.sol";

contract BillboardGovernance is Initializable, OwnableUpgradeable {
    uint256 public duration;
    // In USDC
    uint256 public pricePerBillboard;
    // In BBT
    uint256 public securityDepositForProposal;
    // In BBT
    uint256 public minVotingTokens;
    BillboardToken public token;
    // In USDC
    uint256 public securityDepositAdvertiser;

    struct Proposal {
        uint256 duration;
        uint256 pricePerBillboard;
        uint256 securityDepositForProposal;
        uint256 initialSecurityDeposit;
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
        uint256 securityDepositForProposal,
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

    function updateSecurityDepositForProposal(uint256 _securityDepositForProposal) external onlyOwner {
        securityDepositForProposal = _securityDepositForProposal;
    }

    function initialize(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDepositForProposal,
        address _token,
        uint256 _securityDepositAdvertiser,
        uint256 _minVotingTokens
    ) public initializer {
        __Ownable_init(msg.sender);
        duration = _duration;
        pricePerBillboard = _pricePerBillboard;
        securityDepositForProposal = _securityDepositForProposal;
        token = BillboardToken(_token);
        proposalCount = 0;
        securityDepositAdvertiser = _securityDepositAdvertiser;
        minVotingTokens = _minVotingTokens;
    }

    function createProposal(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDepositForProposal,
        uint256 _minVotingTokens,
        uint256 _securityDepositAdvertiser,
        uint256 deadline,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        token.permit(msg.sender, address(this), securityDepositForProposal, deadline, v, r, s);
        require(
            token.transferFrom(msg.sender, address(this), securityDepositForProposal),
            "Security deposit transfer failed"
        );

        uint256 proposalId = proposalCount;
        proposals[proposalId] = Proposal({
            duration: _duration,
            pricePerBillboard: _pricePerBillboard,
            securityDepositForProposal: _securityDepositForProposal,
            minVotingTokens: _minVotingTokens,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            proposer: msg.sender,
            depositReturned: false,
            initialSecurityDeposit: securityDepositForProposal,
            createdAt: block.timestamp,
            securityDepositAdvertiser: _securityDepositAdvertiser
        });

        proposalCount++;

        emit ProposalCreated(
            proposalId,
            _duration,
            _pricePerBillboard,
            _securityDepositForProposal,
            _minVotingTokens,
            block.timestamp,
            _securityDepositAdvertiser
        );
    }

    function createProposalApprove(
        uint256 _duration,
        uint256 _pricePerBillboard,
        uint256 _securityDepositForProposal,
        uint256 _minVotingTokens,
        uint256 _securityDepositAdvertiser
    ) external {
        require(
            token.transferFrom(msg.sender, address(this), securityDepositForProposal),
            "Security deposit transfer failed"
        );

        uint256 proposalId = proposalCount;
        proposals[proposalId] = Proposal({
            duration: _duration,
            pricePerBillboard: _pricePerBillboard,
            securityDepositForProposal: _securityDepositForProposal,
            minVotingTokens: _minVotingTokens,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            proposer: msg.sender,
            depositReturned: false,
            initialSecurityDeposit: securityDepositForProposal,
            createdAt: block.timestamp,
            securityDepositAdvertiser: _securityDepositAdvertiser
        });

        proposalCount++;

        emit ProposalCreated(
            proposalId,
            _duration,
            _pricePerBillboard,
            _securityDepositForProposal,
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
        securityDepositForProposal = proposal.securityDepositForProposal;
        minVotingTokens = proposal.minVotingTokens;
        securityDepositAdvertiser = proposal.securityDepositAdvertiser;
        proposal.executed = true;

        returnSecurityDepositForProposal(proposalId);

        emit ProposalExecuted(proposalId);
    }

    function returnSecurityDepositForProposal(uint256 proposalId) public {
        require(proposalId < proposalCount, "Invalid proposal");
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.depositReturned, "Deposit already returned");
        require(proposal.createdAt + 7 days < block.timestamp, "Proposal voting not done");

        proposal.depositReturned = true;
        require(token.transfer(proposal.proposer, proposal.initialSecurityDeposit), "Security deposit return failed");

        emit SecurityDepositReturned(proposalId, proposal.proposer, proposal.initialSecurityDeposit);
    }

    function blameAdvertiser(address advertiser, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external {
        require(token.balanceOf(msg.sender) >= minVotingTokens, "Insufficient tokens to blame advertiser");

        token.permit(msg.sender, address(this), minVotingTokens, deadline, v, r, s);
        require(token.transferFrom(msg.sender, address(this), minVotingTokens), "Token transfer failed");

        if (!advertiserIsBlamed[advertiser].isBlamed) {
            advertiserIsBlamed[advertiser] = AdvertiserIsBlamed({
                isBlamed: true,
                createdAt: block.timestamp,
                votesFor: 0,
                votesAgainst: 0,
                resolved: false,
                blameSecurityDeposit: minVotingTokens,
                blameSecurityDepositReturned: false,
                proposer: msg.sender
            });
        }

        voteForBlame(advertiser, true);
        emit AdvertiserBlamed(msg.sender, advertiser);
    }

    function blameAdvertiserApprove(address advertiser) external {
        require(token.balanceOf(msg.sender) >= minVotingTokens, "Insufficient tokens to blame advertiser");
        require(token.transferFrom(msg.sender, address(this), minVotingTokens), "Token transfer failed");

        if (!advertiserIsBlamed[advertiser].isBlamed) {
            advertiserIsBlamed[advertiser] = AdvertiserIsBlamed({
                isBlamed: true,
                createdAt: block.timestamp,
                votesFor: 0,
                votesAgainst: 0,
                resolved: false,
                blameSecurityDeposit: minVotingTokens,
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

    function getProposal(uint256 proposalId) external view returns (Proposal memory proposal) {
        require(proposalId < proposalCount, "Invalid proposal");
        return proposals[proposalId];
    }
}
