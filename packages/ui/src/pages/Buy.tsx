import useBillboard from "../hooks/useBillboard";
import { useEffect, useState } from "react";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  TextField,
  Paper,
  Alert,
  Container,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  Stack,
  useTheme,
  TextareaAutosize,
  Snackbar,
  Slide,
  Switch,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { useConnectWallet } from "@web3-onboard/react";
import { Ticker } from "../components/Ticker";
import { BILLBOARD_ADDRESS } from "../utils/contracts";
import useERC20Permit from "../hooks/useERC20Permit";

export default function Buy() {
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);
  const [vertical, setVertical] = useState(false);

  const {
    buy,
    governanceSettings,
    allowanceUSDC,
    transactionStatus,
    usdcContract,
  } = useBillboard();
  const { getPermit } = useERC20Permit();
  const [{ wallet }, connect] = useConnectWallet();
  const theme = useTheme();

  useEffect(() => {
    if (wallet) {
      allowanceUSDC().then((allowance) => {
        setAllowance(Number(allowance));
      });
    }
  }, [wallet]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      if (file.size > 2097152) {
        setError("File size must be less than 2MB");
        return;
      }

      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        const expectedWidth = !vertical ? 512 : 300;
        const expectedHeight = !vertical ? 300 : 512;

        if (width !== expectedWidth || height !== expectedHeight) {
          setError(
            `Image dimensions must be ${expectedWidth}x${expectedHeight} pixels`,
          );
          return;
        }

        setSelectedFile(file);
        setError(null);
      };

      img.onerror = () => {
        setError("Invalid image file");
      };

      img.src = URL.createObjectURL(file);
    }
  };

  const validateLink = (url: string): boolean => {
    try {
      new URL(url);
      setLinkError(null);
      return true;
    } catch (e) {
      setLinkError("Please enter a valid URL (e.g., https://example.com)");
      return false;
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLink(value);
    if (value.trim()) {
      validateLink(value);
    } else {
      setLinkError(null);
    }
  };

  const handleUpload = async () => {
    if (!wallet) {
      connect();
    } else {
      if (!description.trim()) {
        setError("Please enter a description");
        return;
      }

      if (!link.trim()) {
        setError("Please enter a link");
        return;
      }

      if (!validateLink(link)) {
        setError("Please enter a valid URL");
        return;
      }

      if (!selectedFile) {
        setError("Please select a file first");
        return;
      }

      try {
        setIsUploading(true);
        await buy(description, link, selectedFile, vertical);
        setError(null);
        afterSuccessfullyPurchased();
      } catch (err) {
        setError(
          "Failed to upload image: " +
            (err instanceof Error ? err.message : String(err)),
        );
      } finally {
        setIsUploading(false);
      }
    }
  };

  const afterSuccessfullyPurchased = () => {
    setIsSnackbarOpen(true);
    setDescription("");
    setLink("");
    setSelectedFile(null);
  };

  return (
    <Container maxWidth={false} sx={{ maxWidth: "1440px" }}>
      <Box sx={{ p: 4, my: 4 }}>
        <Typography variant="h1">Buy Billboard</Typography>
        <Typography variant="h6">
          Purchase a billboard—an ad placement—through our platform to promote
          your brand on crypto-focused websites
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
            src="../assets/publisher.svg"
            alt="Billboard"
          />
          <Stack
            direction="column"
            spacing={1}
            width={{ xs: "100%", lg: "500px" }}
            justifyContent="center"
            alignItems="center"
          >
            <Typography
              variant="h6"
              px={2}
              sx={{
                backgroundColor: theme.palette.primary.main,
                borderRadius: "10px",
                textAlign: "center",
                width: "fit-content",
              }}
            >
              {Math.floor(governanceSettings?.duration / 86400)} days
            </Typography>
            <Typography variant="h1" position="relative">
              {governanceSettings?.price.toLocaleString()} USDC
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
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <Typography variant="h6" fontSize="medium">
                Billboard Description
              </Typography>
              <TextareaAutosize
                value={description}
                minRows={3}
                style={{
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "4px",
                  fontFamily: "FuturaPT-Book",
                  fontSize: "16px",
                  color: "white",
                  outline: "none",
                  padding: "4px",
                }}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a description for your billboard"
                required
              />
              <Typography variant="h6" fontSize="medium" mt={2}>
                Link to App
              </Typography>
              <TextField
                size="small"
                variant="outlined"
                value={link}
                onChange={handleLinkChange}
                fullWidth
                required
                error={!!linkError}
                helperText={linkError}
              />

              <Typography variant="body1" fontSize="small" mt={2}>
                Select the orientation of your billboard
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" fontSize="medium">
                  Horizontal
                </Typography>
                <Switch
                  checked={vertical}
                  onChange={() => {
                    setSelectedFile(null);
                    setVertical(!vertical);
                  }}
                />
                <Typography variant="h6" fontSize="medium">
                  Vertical
                </Typography>
              </Stack>
              <Typography variant="body1" fontSize="small" mt={2}>
                {!vertical
                  ? "Select an image with the dimensons of 512x300"
                  : "Select an image with the dimensions of 300x512"}
              </Typography>
              {/* Upload button */}
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
              >
                Upload an image (max 2MB)
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {/* Selected file display */}
              {selectedFile && (
                <Button
                  size="small"
                  onClick={() => setSelectedFile(null)}
                  sx={{ mt: 2, width: "fit-content" }}
                  endIcon={<CloseIcon sx={{ color: "white" }} />}
                >
                  <Typography variant="body1" color="#E3E3E3" fontSize="small">
                    {selectedFile.name}
                  </Typography>
                </Button>
              )}
              {/* Transaction steps */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Transaction Steps
                </Typography>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  {/* Approve USDC if needed */}
                  {governanceSettings && (
                    <Stepper
                      activeStep={
                        (allowance !== null &&
                          allowance >= governanceSettings.price) ||
                        transactionStatus?.permitToken.completed
                          ? 1
                          : 0
                      }
                      orientation="vertical"
                    >
                      <Step
                        completed={
                          (allowance !== null &&
                            allowance >= governanceSettings.price) ||
                          transactionStatus?.permitToken.completed
                        }
                      >
                        <StepButton
                          onClick={async () => {
                            if (
                              wallet &&
                              governanceSettings &&
                              !transactionStatus?.permitToken.pending &&
                              !transactionStatus?.permitToken.completed &&
                              !(
                                allowance !== null &&
                                allowance >= governanceSettings.price
                              )
                            ) {
                              await getPermit(
                                usdcContract,
                                wallet.accounts[0].address,
                                BILLBOARD_ADDRESS,
                                governanceSettings.price.toString(),
                                "2",
                              );
                              const newAllowance = await allowanceUSDC();
                              setAllowance(Number(newAllowance));
                            }
                          }}
                          disabled={
                            transactionStatus?.permitToken.pending ||
                            transactionStatus?.permitToken.completed ||
                            (allowance !== null &&
                              allowance >= governanceSettings.price)
                          }
                        >
                          <StepLabel>
                            <Box>
                              <Typography variant="body2">
                                {transactionStatus?.permitToken.label ||
                                  `Permit USDC (${governanceSettings?.price})`}
                              </Typography>
                              {transactionStatus?.permitToken.pending && (
                                <Typography variant="caption" color="primary">
                                  Processing...
                                </Typography>
                              )}
                              {(transactionStatus?.permitToken.completed ||
                                (allowance !== null &&
                                  allowance >= governanceSettings.price)) && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
                                  ✓ Approved
                                </Typography>
                              )}
                              {transactionStatus?.permitToken.error && (
                                <Typography
                                  variant="caption"
                                  color="error"
                                  sx={{ overflow: "scroll" }}
                                >
                                  Error: {transactionStatus.permitToken.error}
                                </Typography>
                              )}
                            </Box>
                          </StepLabel>
                        </StepButton>
                      </Step>
                      <Step
                        completed={transactionStatus?.buyBillboard.completed}
                      >
                        <StepButton
                          disabled={
                            transactionStatus?.buyBillboard.pending ||
                            transactionStatus?.buyBillboard.completed ||
                            !(
                              allowance !== null &&
                              allowance >= governanceSettings?.price
                            )
                          }
                        >
                          <StepLabel>
                            <Box>
                              <Typography variant="body2">
                                {transactionStatus?.buyBillboard.label ||
                                  "Buy Billboard"}
                              </Typography>
                              {transactionStatus?.buyBillboard.pending && (
                                <Typography variant="caption" color="primary">
                                  Processing...
                                </Typography>
                              )}
                              {transactionStatus?.buyBillboard.completed && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
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
                </Paper>
              </Box>
              {/* Submit button */}
              <Button
                variant="contained"
                size="large"
                onClick={handleUpload}
                sx={{
                  color: "white",
                  mt: 2,
                }}
                disabled={
                  (wallet && (!description || !link || !!linkError)) ||
                  isUploading
                }
              >
                {!wallet ? (
                  "Connect Wallet"
                ) : isUploading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Buy Billboard"
                )}
              </Button>
              {/* Error display */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
              {/* Image preview */}
              {selectedFile && (
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    border: "1px solid #eee",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    fontWeight="medium"
                  >
                    Selected Image Preview
                  </Typography>
                  <Box
                    component="img"
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected image"
                    sx={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                      borderRadius: 1,
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: "text.secondary",
                      wordBreak: "break-all",
                    }}
                  >
                    File: {selectedFile.name}
                  </Typography>
                </Box>
              )}
            </Box>
          </Stack>
        </Stack>
      </Box>
      <Ticker />
      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={6000}
        slots={{ transition: Slide }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        onClose={() => setIsSnackbarOpen(false)}
      >
        <Alert
          severity="success"
          variant="filled"
          sx={{
            bgcolor: theme.palette.primary.main,
            fontSize: "16px",
            fontWeight: "bold",
            fontFamily: "FuturaPT-Book",
          }}
        >
          Successfully purchased a billboard
        </Alert>
      </Snackbar>
    </Container>
  );
}
