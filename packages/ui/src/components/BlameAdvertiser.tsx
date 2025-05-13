import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Step,
  StepButton,
  Stepper,
  StepLabel,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { TransactionStatus } from "../utils/types";
import { useConnectWallet } from "@web3-onboard/react";
import { useGetGovernanceEvents } from "../hooks/useGetGovernanceEvents";
import RefreshIcon from "@mui/icons-material/Refresh";

export const BlameAdvertiser = ({
  blameAdvertiser,
  transactionStatus,
  approveBBT,
  minProposalTokens,
}: {
  blameAdvertiser: (address: string) => Promise<void>;
  transactionStatus: TransactionStatus;
  approveBBT: (amount: number) => Promise<void>;
  minProposalTokens: number;
}) => {
  const { events, refetchEvents, fetchEventsFromFirebase } =
    useGetGovernanceEvents();
  const [{ wallet }] = useConnectWallet();
  const [advertiserAddress, setAdvertiserAddress] = useState("");
  const [blameLoading, setBlameLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  fetchEventsFromFirebase();
  useEffect(() => {
    if (transactionStatus?.approveBBT?.completed) {
      setActiveStep(1);
    }
    if (transactionStatus?.blameAdvertiser?.completed) {
      setActiveStep(2);
    }
  }, [transactionStatus]);

  const handleBlameAdvertiser = async () => {
    if (!advertiserAddress || !wallet) return;

    try {
      setBlameLoading(true);
      await approveBBT(minProposalTokens);
      await blameAdvertiser(advertiserAddress);
      setAdvertiserAddress("");
    } catch (error) {
      console.error("Failed to blame advertiser:", error);
    } finally {
      setBlameLoading(false);
    }
  };

  return (
    <Stack direction="column" spacing={4} width="100%" sx={{ mt: 2 }}>
      <Typography variant="h4" fontWeight={800}>
        BLAME ADVERTISER
      </Typography>
      <Typography variant="body1">
        Report an advertiser who has violated the terms of service.
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          label="Advertiser Address"
          value={advertiserAddress}
          onChange={(e) => setAdvertiserAddress(e.target.value)}
          fullWidth
          size="small"
          placeholder="0x..."
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleBlameAdvertiser}
          disabled={blameLoading || !advertiserAddress || !wallet}
          startIcon={blameLoading ? <CircularProgress size={20} /> : null}
        >
          Blame
        </Button>
      </Stack>

      <Box sx={{ width: "100%", display: "flex" }}>
        <Stepper activeStep={activeStep} orientation="vertical">
          <Step completed={transactionStatus?.approveBBT?.completed}>
            <StepButton>
              <StepLabel>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body2">Approve BBT Tokens</Typography>
                  {transactionStatus?.approveBBT?.pending && (
                    <Typography variant="caption" color="primary">
                      Processing...
                    </Typography>
                  )}
                  {transactionStatus?.approveBBT?.completed && (
                    <Typography variant="caption" color="success.main">
                      ✓ Complete
                    </Typography>
                  )}
                  {transactionStatus?.approveBBT?.error && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ overflow: "scroll" }}
                    >
                      Error: {transactionStatus.approveBBT.error}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
            </StepButton>
          </Step>
          <Step completed={transactionStatus?.blameAdvertiser?.completed}>
            <StepButton>
              <StepLabel>
                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="body2">Blame Advertiser</Typography>
                  {transactionStatus?.blameAdvertiser?.pending && (
                    <Typography variant="caption" color="primary">
                      Processing...
                    </Typography>
                  )}
                  {transactionStatus?.blameAdvertiser?.completed && (
                    <Typography variant="caption" color="success.main">
                      ✓ Complete
                    </Typography>
                  )}
                  {transactionStatus?.blameAdvertiser?.error && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ overflow: "scroll" }}
                    >
                      Error: {transactionStatus.blameAdvertiser.error}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
            </StepButton>
          </Step>
        </Stepper>
        <Divider orientation="vertical" flexItem sx={{ my: 2, mx: 4 }} />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            ml: 4,
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Blamed Advertisers
          </Typography>

          {/* List of blamed advertisers */}
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            {/* We would fetch this data from the governance events */}
            {[].length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No advertisers have been blamed yet.
              </Typography>
            ) : (
              <List>
                {/* This would be populated from the governance events */}
                {[].map((event, index) => (
                  <ListItem key={index} divider={index !== [].length - 1}>
                    <ListItemText
                      primary={`Advertiser: ${event?.advertiser?.substring(0, 8)}...${event?.advertiser?.substring(36)}`}
                      secondary={`Blamed by: ${event?.from?.substring(0, 8)}...${event?.from?.substring(36)}`}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        onClick={() => {
                          /* Vote for advertiser */
                        }}
                      >
                        Vote For
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => {
                          /* Vote against advertiser */
                        }}
                      >
                        Vote Against
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              refetchEvents();
            }}
            startIcon={<RefreshIcon />}
            sx={{ alignSelf: "flex-start" }}
          >
            Refresh Blamed Advertisers
          </Button>
        </Box>
      </Box>
    </Stack>
  );
};
