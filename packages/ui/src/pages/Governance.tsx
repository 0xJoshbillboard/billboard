import { useState } from "react";
import { useConnectWallet } from "@web3-onboard/react";
import useBillboard from "../hooks/useBillboard";
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Step,
  StepButton,
  Stepper,
  StepLabel,
  Tabs,
  Tab,
} from "@mui/material";
import CreateProposal from "../components/Modals/CreateProposal";
import { ProposalsList } from "../components/ProposalList";
import { BlameAdvertiser } from "../components/BlameAdvertiser";
import { useNavigate, useLocation } from "react-router-dom";

export default function Governance() {
  const [{ wallet }] = useConnectWallet();
  const {
    governanceSettings,
    tokenBalance,
    proposals,
    vote,
    executeProposal,
    buyBBT,
    approveBBT,
    usdcBalance,
    transactionStatus,
    blameAdvertiser,
    voteForBlame,
  } = useBillboard();

  const [showCreateProposal, setShowCreateProposal] = useState(false);
  const [buyAmount, setBuyAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get("tab");
  const activeTab = tabParam === "blame" ? 1 : 0;

  const handleBuyBBT = async () => {
    if (!wallet?.accounts[0].address) return;

    try {
      setIsLoading(true);

      const amount = Number(BigInt(parseFloat(buyAmount) * 1e6));

      await buyBBT(amount);

      const newTransaction = {
        id: Date.now(),
        type: "Buy BBT",
        amount: buyAmount,
        timestamp: new Date().toLocaleString(),
        status: "Completed",
      };
      setTransactions([newTransaction, ...transactions]);

      setBuyAmount("");
    } catch (error) {
      console.error("Failed to buy BBT tokens:", error);

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

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    const tabValue = newValue === 1 ? "blame" : "proposals";
    navigate(`?tab=${tabValue}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={4}
          justifyContent="space-between"
        >
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
                  Security Deposit Advertiser
                </Typography>
                <Typography variant="body1">
                  {governanceSettings.securityDepositAdvertiser.toLocaleString()}{" "}
                  USDC
                </Typography>
              </Box>
            </Stack>
          </Stack>
          <Stack
            direction="column"
            spacing={4}
            sx={{ mt: 2, minWidth: "350px" }}
          >
            <Typography variant="h4" fontWeight={800}>
              GOVERNANCE TOKENS
            </Typography>
            <Stack direction="row" spacing={4}>
              <Box>
                <Typography variant="body1">BBT Balance</Typography>
                <Typography variant="h6">
                  {wallet?.accounts[0].address
                    ? tokenBalance.toLocaleString() + " BBT"
                    : "Connect Wallet"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1">USDC Balance</Typography>
                <Typography variant="h6">
                  {wallet?.accounts[0].address
                    ? usdcBalance.toLocaleString() + " USDC"
                    : "Connect Wallet"}
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

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="governance tabs"
          >
            <Tab label="Proposals" />
            <Tab label="Blame Advertiser" />
          </Tabs>
        </Box>

        {activeTab === 0 ? (
          <ProposalsList
            proposals={proposals}
            wallet={wallet}
            vote={vote}
            executeProposal={executeProposal}
            setShowCreateProposal={setShowCreateProposal}
          />
        ) : (
          <BlameAdvertiser
            blameAdvertiser={blameAdvertiser}
            transactionStatus={transactionStatus}
            approveBBT={approveBBT}
            minProposalTokens={governanceSettings.minProposalTokens}
            voteForBlame={voteForBlame}
          />
        )}
      </Stack>
      <CreateProposal
        open={showCreateProposal}
        onClose={() => setShowCreateProposal(false)}
      />
    </Container>
  );
}
