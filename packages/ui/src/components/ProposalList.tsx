import { Button, Chip, Divider } from "@mui/material";
import { Typography } from "@mui/material";
import { Stack } from "@mui/material";
import VoteFor from "./Icons/VoteFor";
import VoteAgainst from "./Icons/VoteAgainst";

export const ProposalsList = ({
  proposals,
  wallet,
  vote,
  executeProposal,
  setShowCreateProposal,
}) => {
  const handleVote = async (proposalId, support) => {
    if (!wallet) return;
    try {
      await vote(proposalId, support);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleExecuteProposal = async (proposalId) => {
    try {
      const tx = await executeProposal(proposalId);
      await tx.wait();
    } catch (error) {
      console.error("Failed to execute proposal:", error);
    }
  };

  return (
    <Stack direction="column" spacing={4} width="100%">
      <Stack
        direction="row"
        spacing={4}
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography variant="h4" fontWeight={800}>
          ACTIVE PROPOSALS
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowCreateProposal(true)}
        >
          Create Proposal
        </Button>
      </Stack>

      <Stack direction="column" spacing={4} width="100%">
        {proposals.length === 0 && (
          <Typography variant="body1">No active proposals</Typography>
        )}
        {proposals.map((proposal) => (
          <Stack
            direction="column"
            spacing={4}
            key={proposal.id.toString().concat("proposal")}
            border="1px solid #444"
            borderRadius={2}
            p={2}
            width="100%"
          >
            <Typography variant="h4">#{proposal.id + 1} {proposal.executed ? <Chip label="Executed" color="success" /> : null}</Typography>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              justifyContent="space-between"
            >
              <Stack direction="column" spacing={2}>
                <Typography variant="body1">Duration</Typography>
                <Typography variant="body1">
                  {proposal.duration / 86400} days
                </Typography>
              </Stack>
              <Stack direction="column" spacing={2}>
                <Typography variant="body1">Price per Billboard</Typography>
                <Typography variant="body1">
                  {(proposal.pricePerBillboard / 1e6).toLocaleString()} USDC
                </Typography>
              </Stack>
              <Stack direction="column" spacing={2}>
                <Typography variant="body1">
                  Security Deposit for creating a Proposal
                </Typography>
                <Typography variant="body1">
                  {(proposal.securityDeposit / 1e6).toLocaleString()} USDC
                </Typography>
              </Stack>
              <Stack direction="column" spacing={2}>
                <Typography variant="body1">
                  Security Deposit Advertiser
                </Typography>
                <Typography variant="body1">
                  {(proposal.securityDepositAdvertiser / 1e6).toLocaleString()}{" "}
                  USDC
                </Typography>
              </Stack>
              <Stack direction="column" spacing={2}>
                <Typography variant="body1">Min Proposal Tokens</Typography>
                <Typography variant="body1">
                  {(proposal.minProposalTokens / 1e18).toLocaleString()} BBT
                </Typography>
              </Stack>
              <Stack direction="column" spacing={2}>
                <Typography variant="body1">Min Voting Tokens</Typography>
                <Typography variant="body1">
                  {(proposal.minVotingTokens / 1e18).toLocaleString()} BBT
                </Typography>
              </Stack>
            </Stack>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  disabled={!wallet}
                  onClick={() => handleVote(proposal.id, true)}
                  startIcon={<VoteFor />}
                >
                  Vote For
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  disabled={!wallet}
                  onClick={() => handleVote(proposal.id, false)}
                  startIcon={<VoteAgainst />}
                >
                  Vote Against
                </Button>
              </Stack>
              <Stack direction="column" spacing={2}>
                <Typography variant="body1">Votes</Typography>
                <Stack direction="row" spacing={2}>
                  <Typography variant="body1">
                    For: {(proposal.votesFor / 1e18).toLocaleString()}
                  </Typography>
                  <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                  <Typography variant="body1">
                    Against: {(proposal.votesAgainst / 1e18).toLocaleString()}
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  disabled={proposal.executed || !wallet}
                  variant="contained"
                  color="primary"
                  onClick={() => handleExecuteProposal(proposal.id)}
                >
                  Execute
                </Button>
              </Stack>
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};
