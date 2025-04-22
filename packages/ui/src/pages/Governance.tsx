import { useState, useEffect } from "react";
import { Contract, BigNumberish, getBigInt, BrowserProvider } from "ethers";
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
  } = useBillboard();
  const [governanceContract, setGovernanceContract] = useState<Contract | null>(
    null,
  );
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [newProposal, setNewProposal] = useState({
    duration: "",
    pricePerBillboard: "",
    securityDeposit: "",
  });
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

  const handleCreateProposal = async () => {
    if (!governanceContract || !tokenContract) return;

    try {
      // Note: In a real implementation, you would need to:
      // 1. Create a merkle tree of token holders
      // 2. Get a snapshot block
      // 3. Generate a merkle proof for the proposer
      // This is simplified for the UI example
      const tx = await createProposal(
        Number(BigInt(newProposal.duration) * BigInt(86400)), // Convert days to seconds
        Number(BigInt(newProposal.pricePerBillboard) * BigInt(1e6)), // Convert to USDC decimals
        Number(BigInt(newProposal.securityDeposit) * BigInt(1e6)), // Convert to USDC decimals
        "0x0", // Placeholder for merkle root
        0, // Placeholder for snapshot block
        Number(BigInt(tokenBalance) * BigInt(1e18)), // Current token balance
        [], // Placeholder for merkle proof
      );
      await tx.wait();
      setNewProposal({
        duration: "",
        pricePerBillboard: "",
        securityDeposit: "",
      });
    } catch (error) {
      console.error("Failed to create proposal:", error);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!governanceContract) return;

    try {
      // Note: In a real implementation, you would need to:
      // 1. Generate a merkle proof for the voter's token balance
      // This is simplified for the UI example
      const tx = await vote(
        proposalId,
        support,
        Number(BigInt(tokenBalance) * BigInt(1e18)), // Current token balance
        [], // Placeholder for merkle proof
      );
      await tx.wait();
    } catch (error) {
      console.error("Failed to vote:", error);
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateProposal}
              disabled={
                !newProposal.duration ||
                !newProposal.pricePerBillboard ||
                !newProposal.securityDeposit
              }
            >
              Create Proposal
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
                      >
                        Vote For
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleVote(proposal.id, false)}
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
