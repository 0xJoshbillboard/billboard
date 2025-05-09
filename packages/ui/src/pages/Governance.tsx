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
  Stack,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Step,
  StepButton,
  Stepper,
  StepLabel,
  Divider,
} from "@mui/material";
import CreateProposal from "../components/Modals/CreateProposal";
import VoteFor from "../components/Icons/VoteFor";
import VoteAgainst from "../components/Icons/VoteAgainst";

export default function Governance() {
  const [{ wallet }] = useConnectWallet();
  const {
    governanceSettings,
    tokenBalance,
    proposals,
    vote,
    executeProposal,
    buyBBT,
    usdcBalance,
    transactionStatus,
  } = useBillboard();
  const [governanceContract, setGovernanceContract] = useState<Contract | null>(
    null,
  );
  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [tokenContract, setTokenContract] = useState<Contract | null>(null);
  const [buyAmount, setBuyAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [transactions, setTransactions] = useState<any[]>([]);

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

      // Add transaction to list
      const newTransaction = {
        id: Date.now(),
        type: "Buy BBT",
        amount: buyAmount,
        timestamp: new Date().toLocaleString(),
        status: "Completed",
      };
      setTransactions([newTransaction, ...transactions]);

      // Reset input field after successful purchase
      setBuyAmount("");
    } catch (error) {
      console.error("Failed to buy BBT tokens:", error);
      setErrorMessage("Failed to buy BBT tokens. Please try again.");

      // Add failed transaction
      const failedTransaction = {
        id: Date.now(),
        type: "Buy BBT",
        amount: buyAmount,
        timestamp: new Date().toLocaleString(),
        status: "Failed",
      };
      setTransactions([failedTransaction, ...transactions]);
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
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="space-between"
        >
          {/* Current Settings */}
          <Stack direction="column" spacing={4} sx={{ mt: 2 }}>
            <Typography variant="h4" fontWeight={800}>
              CURRENT SETTINGS
            </Typography>
            <Stack direction="column" spacing={4} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="body1">Duration</Typography>
                <Typography variant="body1">
                  {governanceSettings.duration
                    ? governanceSettings.duration / 86400
                    : 0}{" "}
                  days
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">Price per Billboard</Typography>
                <Typography variant="body1">
                  {governanceSettings.price.toLocaleString()} USDC
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">
                  Security Deposit for creating a Proposal
                </Typography>
                <Typography variant="body1">
                  {governanceSettings.securityDeposit.toLocaleString()} USDC
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">Min Proposal Tokens</Typography>
                <Typography variant="body1">
                  {governanceSettings.minProposalTokens
                    ? governanceSettings.minProposalTokens.toLocaleString()
                    : 0}{" "}
                  BBT
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">Min Voting Tokens</Typography>
                <Typography variant="body1">
                  {governanceSettings.minVotingTokens
                    ? governanceSettings.minVotingTokens.toLocaleString()
                    : 0}{" "}
                  BBT
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">
                  Security Deposit Provider
                </Typography>
                <Typography variant="body1">
                  {governanceSettings.securityDepositProvider} USDC
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack
            direction="column"
            spacing={4}
            sx={{ mt: 2, minWidth: "400px" }}
          >
            <Typography variant="h4" fontWeight={800}>
              GOVERNANCE TOKENS
            </Typography>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="body1">BBT Balance</Typography>
                <Typography variant="h6">
                  {tokenBalance.toLocaleString()} BBT
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">USDC Balance</Typography>
                <Typography variant="h6">
                  {usdcBalance.toLocaleString()} USDC
                </Typography>
              </Box>
            </Stack>
            <Typography variant="h6" gutterBottom>
              Buy BBT Tokens
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="USDC Amount"
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
              <Button
                variant="contained"
                onClick={handleBuyBBT}
                disabled={isLoading || !buyAmount || parseFloat(buyAmount) <= 0}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
                sx={{ width: "100px" }}
              >
                Buy BBT
              </Button>
            </Stack>
            {errorMessage && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage}
              </Alert>
            )}
            <Box border="1px solid #444" borderRadius={2} p={2}>
              <Typography variant="h6" gutterBottom>
                Transaction Status
              </Typography>
              {transactionStatus && (
                <Stepper
                  activeStep={transactionStatus?.approveUSDC.completed ? 1 : 0}
                  orientation="vertical"
                >
                  <Step completed={transactionStatus?.approveUSDC.completed}>
                    <StepButton
                      disabled={
                        transactionStatus?.approveUSDC.pending ||
                        transactionStatus?.approveUSDC.completed
                      }
                    >
                      <StepLabel>
                        <Box>
                          <Typography variant="body1">
                            {transactionStatus?.approveUSDC.label ||
                              "Approve USDC"}
                          </Typography>
                          {transactionStatus?.approveUSDC.pending && (
                            <Typography variant="caption" color="primary">
                              Processing...
                            </Typography>
                          )}
                          {transactionStatus?.approveUSDC.completed && (
                            <Typography variant="caption" color="success.main">
                              ✓ Approved
                            </Typography>
                          )}
                          {transactionStatus?.approveUSDC.error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ overflow: "scroll" }}
                            >
                              Error: {transactionStatus.approveUSDC.error}
                            </Typography>
                          )}
                        </Box>
                      </StepLabel>
                    </StepButton>
                  </Step>
                  <Step completed={transactionStatus?.buyBillboard.completed}>
                    <StepButton
                      disabled={
                        transactionStatus?.buyBillboard.pending ||
                        transactionStatus?.buyBillboard.completed ||
                        !transactionStatus?.approveUSDC.completed
                      }
                    >
                      <StepLabel>
                        <Box>
                          <Typography variant="body1">
                            {transactionStatus?.buyBillboard.label ||
                              "Buy Billboard"}
                          </Typography>
                          {transactionStatus?.buyBillboard.pending && (
                            <Typography variant="caption" color="primary">
                              Processing...
                            </Typography>
                          )}
                          {transactionStatus?.buyBillboard.completed && (
                            <Typography variant="caption" color="success.main">
                              ✓ Complete
                            </Typography>
                          )}
                          {transactionStatus?.buyBillboard.error && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ overflow: "scroll" }}
                            >
                              Error: {transactionStatus.buyBillboard.error}
                            </Typography>
                          )}
                        </Box>
                      </StepLabel>
                    </StepButton>
                  </Step>
                </Stepper>
              )}
            </Box>
          </Stack>
        </Stack>

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
              <Typography variant="h4">#{proposal.id + 1}</Typography>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={4}
                justifyContent="space-between"
              >
                <Stack direction="column" spacing={2}>
                  <Typography variant="body1">Duration</Typography>
                  <Typography variant="body1">
                    {proposal.duration} days
                  </Typography>
                </Stack>
                <Stack direction="column" spacing={2}>
                  <Typography variant="body1">Price per Billboard</Typography>
                  <Typography variant="body1">
                    {(proposal.pricePerBillboard / 1e18).toLocaleString()} USDC
                  </Typography>
                </Stack>
                <Stack direction="column" spacing={2}>
                  <Typography variant="body1">
                    Security Deposit for creating a Proposal
                  </Typography>
                  <Typography variant="body1">
                    {(proposal.securityDeposit / 1e18).toLocaleString()} BBT
                  </Typography>
                </Stack>
                <Stack direction="column" spacing={2}>
                  <Typography variant="body1">
                    Security Deposit Provider
                  </Typography>
                  <Typography variant="body1">
                    {proposal.securityDepositProvider.toString()} USDC
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
                    onClick={() => handleVote(proposal.id, true)}
                    startIcon={<VoteFor />}
                  >
                    Vote For
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
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
                      For: {proposal.votesFor.toString()}
                    </Typography>
                    <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                    <Typography variant="body1">
                      Against: {proposal.votesAgainst.toString()}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    disabled={proposal.executed}
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
      <CreateProposal
        open={showCreateProposal}
        onClose={() => setShowCreateProposal(false)}
      />
    </Container>
  );
}
