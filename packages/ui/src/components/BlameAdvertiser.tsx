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
import VoteAgainst from "./Icons/VoteAgainst";
import VoteFor from "./Icons/VoteFor";

export const BlameAdvertiser = ({
  blameAdvertiser,
  transactionStatus,
  approveBBT,
  minProposalTokens,
  voteForBlame,
  resolveAdvertiserBlame,
}: {
  blameAdvertiser: (address: string) => Promise<void>;
  transactionStatus: TransactionStatus;
  approveBBT: (amount: number) => Promise<void>;
  minProposalTokens: number;
  voteForBlame: (address: string, support: boolean) => Promise<void>;
  resolveAdvertiserBlame: (address: string) => Promise<void>;
}) => {
  const { events, loading } = useGetGovernanceEvents();
  const [{ wallet }] = useConnectWallet();
  const [advertiserAddress, setAdvertiserAddress] = useState("");
  const [blameLoading, setBlameLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  console.log(events);

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

  const calculateTimeRemaining = (timestamp: number | Date) => {
    const createdDate =
      typeof timestamp === "number" ? new Date(timestamp * 1000) : timestamp;
    const endDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days voting period
    const now = new Date();

    if (now > endDate) {
      return "Voting period ended";
    }

    const remainingMs = endDate.getTime() - now.getTime();
    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    return `${days}d ${hours}h remaining`;
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

      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Stepper
          activeStep={activeStep}
          orientation="vertical"
          sx={{ height: "140px" }}
        >
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
            ml: { xs: 0, md: 4 },
          }}
        >
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Blamed Advertisers
          </Typography>

          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ml: 2 }}
                >
                  Loading blamed advertisers...
                </Typography>
              </Box>
            ) : events.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No advertisers have been blamed yet.
              </Typography>
            ) : (
              <List>
                {events.map((event, index) => (
                  <ListItem key={index} divider={index !== events.length - 1}>
                    <ListItemText
                      sx={{ fontSize: "12px", cursor: "pointer" }}
                      onClick={() => {
                        navigator.clipboard.writeText(event?.advertiser || "");
                        alert("Address copied to clipboard!");
                      }}
                      primary={`Advertiser: ${event?.advertiser?.substring(0, 4)}...${event?.advertiser?.substring(38)}`}
                      secondary={
                        <Box component="span">
                          <Typography
                            variant="body1"
                            component="span"
                            fontSize="10px"
                            sx={{ cursor: "pointer" }}
                            onClick={() => {
                              navigator.clipboard.writeText(event?.voter || "");
                              alert("Address copied to clipboard!");
                            }}
                          >
                            Blamed by: {event?.voter?.substring(0, 4)}...
                            {event?.voter?.substring(38)}
                          </Typography>
                          <br />
                          <Typography
                            variant="body1"
                            component="span"
                            fontSize="10px"
                          >
                            Created: {event?.timestampDate.toLocaleString()}
                          </Typography>
                          <br />
                          <Typography
                            variant="body1"
                            component="span"
                            fontSize="10px"
                          >
                            Time Remaining:{" "}
                            {calculateTimeRemaining(event?.timestampDate)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
                      <Button
                        variant="outlined"
                        color="success"
                        size="small"
                        startIcon={<VoteFor />}
                        onClick={() => {
                          voteForBlame(event.advertiser, true);
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<VoteAgainst />}
                        onClick={() => {
                          voteForBlame(event.advertiser, false);
                        }}
                      />
                      <Button
                        variant="outlined"
                        color="primary"
                        size="small"
                        disabled={
                          !wallet ||
                          event.timestampDate.getTime() <
                            Date.now() + 7 * 24 * 60 * 60 * 1000
                        }
                        onClick={() => {
                          resolveAdvertiserBlame(event.advertiser);
                        }}
                      >
                        Resolve
                      </Button>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Stack>
  );
};
