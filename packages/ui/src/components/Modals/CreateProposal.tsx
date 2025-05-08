import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  TextField,
  Stack,
  Alert,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepButton,
} from "@mui/material";
import useBillboard from "../../hooks/useBillboard";
import CloseIcon from "@mui/icons-material/Close";

interface CreateProposalProps {
  open: boolean;
  onClose: () => void;
}

const CreateProposal: React.FC<CreateProposalProps> = ({ open, onClose }) => {
  const { createProposal, transactionStatus } = useBillboard();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [proposal, setProposal] = useState({
    duration: "",
    pricePerBillboard: "",
    securityDeposit: "",
    minProposalTokens: "",
    minVotingTokens: "",
    securityDepositProvider: "",
  });

  const handleCreateProposal = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const tx = await createProposal(
        BigInt(proposal.duration) * BigInt(86400), // Convert days to seconds
        BigInt(proposal.pricePerBillboard) * BigInt(1e6), // Convert to USDC decimals
        BigInt(proposal.securityDeposit) * BigInt(1e6), // Convert to USDC decimals
        BigInt(proposal.minProposalTokens) * BigInt(1e18), // Convert to BBT decimals
        BigInt(proposal.minVotingTokens) * BigInt(1e18), // Convert to BBT decimals
        BigInt(proposal.securityDepositProvider) * BigInt(1e6), // Convert to USDC decimals
      );
      await tx.wait();
      onClose();
    } catch (error) {
      console.error("Failed to create proposal:", error);
      setErrorMessage("Failed to create proposal. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderTransactionStatus = () => {
    if (!transactionStatus) return null;

    const { approveUSDC, createProposal } = transactionStatus;

    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="body1" gutterBottom color="white">
          Transaction Steps
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            bgcolor: "transparent",
            borderColor: "rgba(255, 255, 255, 0.23)",
          }}
        >
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
                    <Typography variant="body2" color="white">
                      {transactionStatus?.approveUSDC.label || "Approve USDC"}
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
            <Step completed={transactionStatus?.createProposal.completed}>
              <StepButton
                disabled={
                  transactionStatus?.createProposal.pending ||
                  transactionStatus?.createProposal.completed
                }
              >
                <StepLabel>
                  <Box>
                    <Typography variant="body2" color="white">
                      {transactionStatus?.createProposal.label ||
                        "Create Proposal"}
                    </Typography>
                    {transactionStatus?.createProposal.pending && (
                      <Typography variant="caption" color="primary">
                        Processing...
                      </Typography>
                    )}
                    {transactionStatus?.createProposal.completed && (
                      <Typography variant="caption" color="success.main">
                        ✓ Complete
                      </Typography>
                    )}
                    {transactionStatus?.createProposal.error && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ overflow: "scroll" }}
                      >
                        Error: {transactionStatus.createProposal.error}
                      </Typography>
                    )}
                  </Box>
                </StepLabel>
              </StepButton>
            </Step>
          </Stepper>
        </Paper>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      aria-labelledby="create-proposal-title"
      aria-describedby="create-proposal-description"
      maxWidth="sm"
      fullWidth
      onClose={(_, reason) => {
        if (reason === "backdropClick") {
          return;
        }
      }}
      PaperProps={{
        sx: {
          bgcolor: "#1E1E1E",
          color: "white",
        },
      }}
    >
      <DialogTitle id="create-proposal-title" sx={{ bgcolor: "#1E1E1E" }}>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          justifyContent="space-between"
        >
          <Typography variant="h3" color="white">
            Create Proposal
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: "#1E1E1E", p: 2 }}>
        <Stack spacing={3} sx={{ p: 2 }}>
          <TextField
            label="Duration (days)"
            type="number"
            value={proposal.duration}
            onChange={(e) =>
              setProposal({ ...proposal, duration: e.target.value })
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <TextField
            label="Price per Billboard (USDC)"
            type="number"
            value={proposal.pricePerBillboard}
            onChange={(e) =>
              setProposal({
                ...proposal,
                pricePerBillboard: e.target.value,
              })
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <TextField
            label="Security Deposit (USDC)"
            type="number"
            value={proposal.securityDeposit}
            onChange={(e) =>
              setProposal({
                ...proposal,
                securityDeposit: e.target.value,
              })
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <TextField
            label="Security Deposit Provider (USDC)"
            type="number"
            value={proposal.securityDepositProvider}
            onChange={(e) =>
              setProposal({
                ...proposal,
                securityDepositProvider: e.target.value,
              })
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <TextField
            label="Minimum Proposal Tokens (BBT)"
            type="number"
            value={proposal.minProposalTokens}
            onChange={(e) =>
              setProposal({
                ...proposal,
                minProposalTokens: e.target.value,
              })
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          <TextField
            label="Minimum Voting Tokens (BBT)"
            type="number"
            value={proposal.minVotingTokens}
            onChange={(e) =>
              setProposal({
                ...proposal,
                minVotingTokens: e.target.value,
              })
            }
            fullWidth
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.23)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(255, 255, 255, 0.5)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "primary.main",
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(255, 255, 255, 0.7)",
              },
            }}
          />
          {renderTransactionStatus()}
          {errorMessage && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {errorMessage}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#1E1E1E", p: 2 }}>
        <Button
          onClick={handleCreateProposal}
          variant="contained"
          color="primary"
          autoFocus
          fullWidth
          disabled={
            !proposal.duration ||
            !proposal.pricePerBillboard ||
            !proposal.securityDeposit ||
            !proposal.minProposalTokens ||
            !proposal.minVotingTokens ||
            !proposal.securityDepositProvider ||
            isLoading
          }
        >
          {isLoading ? "Creating..." : "Create Proposal"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProposal;
