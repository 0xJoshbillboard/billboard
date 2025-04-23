import { useState, useEffect } from "react";
import { Contract, BrowserProvider } from "ethers";
import { useConnectWallet } from "@web3-onboard/react";
import useBillboard from "../hooks/useBillboard";
import {
  GOVERNANCE_ADDRESS,
  GOVERNANCE_ABI,
  BILLBOARD_TOKEN_ADDRESS,
  BILLBOARD_TOKEN_ABI,
} from "../utils/contracts";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Alert,
  Divider,
} from "@mui/material";

export default function Governance() {
  const [{ wallet }] = useConnectWallet();
  const {
    governanceSettings,
    tokenBalance,
    proposals,
    hasVoted,
    createProposal,
    vote,
    executeProposal,
    buyBBT,
    usdcBalance,
  } = useBillboard();
  const [governanceContract, setGovernanceContract] = useState<Contract | null>(
    null,
  );
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [newProposal, setNewProposal] = useState({
    duration: "",
    pricePerBillboard: "",
    securityDeposit: "",
    votingPeriod: "",
    minProposalTokens: "",
    minVotingTokens: "",
  });
  const [buyAmount, setBuyAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const theme = useTheme();

  useEffect(() => {
    const setupContracts = async () => {
      if (wallet?.provider) {
        const provider = new BrowserProvider(wallet.provider);
        const signer = await provider.getSigner();
        setGovernanceContract(
          new Contract(GOVERNANCE_ADDRESS, GOVERNANCE_ABI, signer),
        );
        setTokenContract(
          new Contract(BILLBOARD_TOKEN_ADDRESS, BILLBOARD_TOKEN_ABI, signer),
        );
      }
    };
    setupContracts();
  }, [wallet]);

  const handleBuyBBT = async () => {
    if (!tokenContract || !wallet?.accounts[0].address) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      // Convert to USDC decimals (6 decimals)
      const amount = Number(BigInt(parseFloat(buyAmount) * 1e6));

      await buyBBT(amount);

      // Reset input field after successful purchase
      setBuyAmount("");
    } catch (error) {
      console.error("Failed to buy BBT tokens:", error);
      setErrorMessage("Failed to buy BBT tokens. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProposal = async () => {
    if (!governanceContract || !tokenContract) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const tx = await createProposal(
        Number(BigInt(newProposal.duration) * BigInt(86400)), // Convert days to seconds
        Number(BigInt(newProposal.pricePerBillboard) * BigInt(1e6)), // Convert to USDC decimals
        Number(BigInt(newProposal.securityDeposit) * BigInt(1e6)), // Convert to USDC decimals
        Number(BigInt(newProposal.votingPeriod) * BigInt(86400)), // Convert days to seconds
        Number(BigInt(newProposal.minProposalTokens) * BigInt(1e18)), // Convert to token decimals
        Number(BigInt(newProposal.minVotingTokens) * BigInt(1e18)), // Convert to token decimals
      );
      await tx.wait();
      setNewProposal({
        duration: "",
        pricePerBillboard: "",
        securityDeposit: "",
        votingPeriod: "",
        minProposalTokens: "",
        minVotingTokens: "",
      });
    } catch (error) {
      console.error("Failed to create proposal:", error);
      setErrorMessage("Failed to create proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!governanceContract) return;

    try {
      setIsLoading(true);
      setErrorMessage("");

      const tx = await vote(
        proposalId,
        support,
        Number(BigInt(tokenBalance) * BigInt(1e18)), // Current token balance
      );
      await tx.wait();
    } catch (error) {
      console.error("Failed to vote:", error);
      setErrorMessage("Failed to vote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteProposal = async (proposalId: number) => {
    if (!governanceContract) return;

    try {
      const tx = await executeProposal(proposalId);
      await tx.wait();
    } catch (error) {
      console.error("Failed to execute proposal:", error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Current Settings */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Current Settings
          </Typography>
          <Stack direction="row" spacing={4} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Duration
              </Typography>
              <Typography variant="h6">
                {governanceSettings.duration
                  ? governanceSettings.duration / 86400
                  : 0}{" "}
                days
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Price per Billboard
              </Typography>
              <Typography variant="h6">
                {governanceSettings.price || 0} USDC
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Voting Period
              </Typography>
              <Typography variant="h6">
                {governanceSettings.votingPeriod
                  ? governanceSettings.votingPeriod
                  : 0}{" "}
                days
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Min Proposal Tokens
              </Typography>
              <Typography variant="h6">
                {governanceSettings.minProposalTokens
                  ? governanceSettings.minProposalTokens
                  : 0}{" "}
                BBT
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" color="text.secondary">
                Min Voting Tokens
              </Typography>
              <Typography variant="h6">
                {governanceSettings.minVotingTokens
                  ? governanceSettings.minVotingTokens
                  : 0}{" "}
                BBT
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Buy BBT Tokens */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Governance Tokens
          </Typography>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  BBT Balance
                </Typography>
                <Typography variant="h6">{tokenBalance} BBT</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle1" color="text.secondary">
                  USDC Balance
                </Typography>
                <Typography variant="h6">{usdcBalance} USDC</Typography>
              </Box>
            </Stack>
            <Divider />
            <Typography variant="h6">Buy BBT Tokens</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="Amount (USDC)"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                fullWidth
                helperText="1 USDC = 1 BBT"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleBuyBBT}
                disabled={!buyAmount || isLoading || parseFloat(buyAmount) <= 0}
                sx={{ height: 56 }}
              >
                {isLoading ? "Processing..." : "Buy Tokens"}
              </Button>
            </Stack>
            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Create Proposal */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Create New Proposal
          </Typography>
          <Stack spacing={3} sx={{ mt: 3 }}>
            <TextField
              label="Duration (days)"
              type="number"
              value={newProposal.duration}
              onChange={(e) =>
                setNewProposal({ ...newProposal, duration: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Price per Billboard (USDC)"
              type="number"
              value={newProposal.pricePerBillboard}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  pricePerBillboard: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Security Deposit (USDC)"
              type="number"
              value={newProposal.securityDeposit}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  securityDeposit: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Voting Period (days)"
              type="number"
              value={newProposal.votingPeriod}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  votingPeriod: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Minimum Proposal Tokens (BBT)"
              type="number"
              value={newProposal.minProposalTokens}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  minProposalTokens: e.target.value,
                })
              }
              fullWidth
            />
            <TextField
              label="Minimum Voting Tokens (BBT)"
              type="number"
              value={newProposal.minVotingTokens}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  minVotingTokens: e.target.value,
                })
              }
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateProposal}
              disabled={
                !newProposal.duration ||
                !newProposal.pricePerBillboard ||
                !newProposal.securityDeposit ||
                !newProposal.votingPeriod ||
                !newProposal.minProposalTokens ||
                !newProposal.minVotingTokens ||
                isLoading
              }
            >
              {isLoading ? "Creating..." : "Create Proposal"}
            </Button>
          </Stack>
        </Paper>

        {/* Proposals List */}
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Active Proposals
          </Typography>
          <Stack spacing={3} sx={{ mt: 3 }}>
            {proposals.map((proposal) => (
              <Card key={proposal.id}>
                <CardContent>
                  <Stack direction="row" spacing={4}>
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="h6">
                        {proposal.duration / 86400} days
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Price per Billboard
                      </Typography>
                      <Typography variant="h6">
                        {proposal.pricePerBillboard / 1e6} USDC
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Security Deposit
                      </Typography>
                      <Typography variant="h6">
                        {proposal.securityDeposit / 1e6} USDC
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Voting Period
                      </Typography>
                      <Typography variant="h6">
                        {proposal.votingPeriod / 86400} days
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Min Proposal Tokens
                      </Typography>
                      <Typography variant="h6">
                        {proposal.minProposalTokens / 1e18} BBT
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Min Voting Tokens
                      </Typography>
                      <Typography variant="h6">
                        {proposal.minVotingTokens / 1e18} BBT
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" color="text.secondary">
                        Votes
                      </Typography>
                      <Typography variant="h6">
                        For: {proposal.votesFor / 1e18} | Against:{" "}
                        {proposal.votesAgainst / 1e18}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions>
                  {!hasVoted[proposal.id] && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleVote(proposal.id, true)}
                        disabled={isLoading}
                      >
                        Vote For
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleVote(proposal.id, false)}
                        disabled={isLoading}
                      >
                        Vote Against
                      </Button>
                    </>
                  )}
                  {!proposal.executed &&
                    proposal.votesFor > proposal.votesAgainst && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleExecuteProposal(proposal.id)}
                        disabled={isLoading}
                      >
                        Execute Proposal
                      </Button>
                    )}
                </CardActions>
              </Card>
            ))}
            {proposals.length === 0 && (
              <Alert severity="info">No active proposals</Alert>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
