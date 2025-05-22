import { useEffect, useState } from "react";
import useBillboard from "../hooks/useBillboard";
import { Billboard } from "billboard-sdk";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Stack,
  Box,
  Button,
  useTheme,
  TextField,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Paper,
} from "@mui/material";
import { useConnectWallet } from "@web3-onboard/react";
import { Ticker } from "../components/Ticker";

export default function SDK() {
  // State management
  const [ads, setAds] = useState<Billboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [providerHandle, setProviderHandle] = useState("");
  const [adsAreLoading, setAdsAreLoading] = useState(false);

  // Hooks
  const { getAds, registerProvider, governanceSettings, transactionStatus } =
    useBillboard();
  const [{ wallet }, connect] = useConnectWallet();
  const theme = useTheme();

  useEffect(() => {
    const fetchingAds = async () => {
      setAdsAreLoading(true);
      try {
        const fetchedAds = await getAds();
        setAds(fetchedAds);
      } catch (error) {
        console.error("Error fetching ads:", error);
      } finally {
        setAdsAreLoading(false);
      }
    };
    fetchingAds();
  }, []);

  // Provider registration
  const handleRegisterProvider = async () => {
    if (!wallet) {
      connect();
      return;
    }

    setLoading(true);
    try {
      await registerProvider(providerHandle.trim());
      setProviderHandle("");
    } catch (error: any) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: "1440px" }}>
      <Box sx={{ p: 4, my: 4 }}>
        <Typography variant="h1">Sell Space</Typography>
        <Typography variant="h6">
          Join our network of providers and start earning USDC by displaying
          advertisements on your platform.
        </Typography>

        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={16}
          justifyContent="space-between"
          alignItems={{ xs: "center", lg: "flex-start" }}
          mt={8}
        >
          <Box
            component="img"
            width="100%"
            style={{ maxWidth: "400px" }}
            height="auto"
            src="../assets/advertiser.svg"
            alt="Billboard SDK"
          />

          <Stack
            direction="column"
            spacing={1}
            width={{ xs: "100%", lg: "500px" }}
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="h1" position="relative">
              {governanceSettings?.securityDepositAdvertiser.toLocaleString()}{" "}
              USDC
              <Typography
                variant="h4"
                fontWeight="bold"
                position="absolute"
                top={10}
                left="-10px"
              >
                $
              </Typography>
            </Typography>

            <Typography variant="body1" textAlign="center" mb={2}>
              Security deposit required to join our network of advertisers
            </Typography>

            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <Typography variant="h6" fontSize="medium">
                Advertiser Handle
              </Typography>
              <TextField
                size="small"
                variant="outlined"
                value={providerHandle}
                onChange={(e) => setProviderHandle(e.target.value)}
                fullWidth
                placeholder="Enter your unique advertiser identifier"
                required
              />

              {/* Transaction steps */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Transaction Steps
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Stepper
                    activeStep={
                      transactionStatus.registerProvider.completed
                        ? 2
                        : transactionStatus.permitToken.completed
                          ? 1
                          : transactionStatus.permitToken.pending
                            ? 0
                            : -1
                    }
                    orientation="vertical"
                  >
                    <Step>
                      <StepButton
                        disabled={
                          transactionStatus.permitToken.pending ||
                          transactionStatus.permitToken.completed
                        }
                      >
                        <StepLabel
                          sx={{
                            overflow: "auto",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                          }}
                        >
                          <Box>
                            <Typography variant="body2">
                              {transactionStatus.permitToken.label ||
                                "Approve USDC"}
                            </Typography>
                            {transactionStatus.permitToken.pending && (
                              <Typography variant="caption" color="primary">
                                Processing...
                              </Typography>
                            )}
                            {transactionStatus.permitToken.completed && (
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                ✓ Approved
                              </Typography>
                            )}
                            {transactionStatus.permitToken.error && (
                              <Typography variant="body1" color="error">
                                Error: {transactionStatus.permitToken.error}
                              </Typography>
                            )}
                          </Box>
                        </StepLabel>
                      </StepButton>
                    </Step>
                    <Step>
                      <StepButton
                        disabled={
                          !transactionStatus.permitToken.completed ||
                          transactionStatus.registerProvider.pending ||
                          transactionStatus.registerProvider.completed
                        }
                      >
                        <StepLabel
                          sx={{
                            overflow: "auto",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                          }}
                        >
                          <Box>
                            <Typography variant="body2">
                              {transactionStatus.registerProvider.label ||
                                "Register Provider"}
                            </Typography>
                            {transactionStatus.registerProvider.pending && (
                              <Typography variant="caption" color="primary">
                                Processing...
                              </Typography>
                            )}
                            {transactionStatus.registerProvider.completed && (
                              <Typography
                                variant="caption"
                                color="success.main"
                              >
                                ✓ Complete
                              </Typography>
                            )}
                            {transactionStatus.registerProvider.error && (
                              <Typography variant="body1" color="error">
                                Error:{" "}
                                {transactionStatus.registerProvider.error}
                              </Typography>
                            )}
                          </Box>
                        </StepLabel>
                      </StepButton>
                    </Step>
                  </Stepper>
                </Paper>
              </Box>

              {/* Submit button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleRegisterProvider}
                sx={{
                  color: "white",
                  mt: 2,
                }}
                disabled={
                  providerHandle.length < 3 ||
                  loading ||
                  transactionStatus.permitToken.pending ||
                  transactionStatus.registerProvider.pending
                }
                startIcon={
                  transactionStatus.permitToken.pending ||
                  transactionStatus.registerProvider.pending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : null
                }
              >
                {!wallet
                  ? "Connect Wallet"
                  : transactionStatus.permitToken.pending
                    ? "Approving USDC..."
                    : transactionStatus.registerProvider.pending
                      ? "Registering Provider..."
                      : "Register as Provider"}
              </Button>
            </Box>
          </Stack>
        </Stack>

        <Ticker />

        <Typography variant="h2" component="h2" gutterBottom>
          ALL ADS
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Stack
            direction="row"
            flexWrap="wrap"
            spacing={0}
            sx={{
              gap: 4,
              justifyContent: "center",
            }}
          >
            {adsAreLoading ? (
              <CircularProgress />
            ) : ads.length > 0 ? (
              ads.map((ad) => (
                <Card
                  key={ad.hash.concat(ad.link)}
                  onClick={() => {
                    window.open(ad.link, "_blank", "noopener,noreferrer");
                  }}
                  sx={{
                    cursor: "pointer",
                    width: 320,
                    height: 300,
                    padding: 2,
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: theme.palette.grey[100],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      src={ad.url}
                      alt={ad.description}
                      sx={{
                        objectFit: "cover",
                        width: "100%",
                        background: theme.palette.background.default,
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: 3,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        height: 56,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {ad.description}
                    </Typography>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Typography variant="h6">No ads found</Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
