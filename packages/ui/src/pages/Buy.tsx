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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { useConnectWallet } from "@web3-onboard/react";
import { Ticker } from "../components/Ticker";

export default function Buy() {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomCID, setUseCustomCID] = useState<"upload" | "cid" | null>(
    null,
  );
  const [customCID, setCustomCID] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [allowance, setAllowance] = useState<number | null>(null);

  // Hooks
  const {
    buy,
    getUSDCMock,
    governanceSettings,
    allowanceUSDC,
    transactionStatus,
    approveUSDC,
  } = useBillboard();
  const [{ wallet }, connect] = useConnectWallet();
  const theme = useTheme();

  useEffect(() => {
    if (wallet) {
      allowanceUSDC().then((allowance) => {
        setAllowance(Number(allowance));
      });
    }
  }, [wallet]);

  // File handling
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
      setError(null);
    }
  };

  // Validation
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

  // Form submission
  const handleUpload = async () => {
    if (!wallet) {
      connect();
    } else {
      // Validate inputs
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

      // Handle custom CID path
      if (useCustomCID) {
        if (!customCID.trim()) {
          setError("Please enter a CID");
          return;
        }

        try {
          setIsUploading(true);
          await buy(description, link, null, customCID);
          setError(null);
        } catch (err) {
          setError(
            "Failed to process with custom CID: " +
              (err instanceof Error ? err.message : String(err)),
          );
        } finally {
          setIsUploading(false);
        }
      }
      // Handle file upload path
      else {
        if (!selectedFile) {
          setError("Please select a file first");
          return;
        }

        try {
          setIsUploading(true);
          await buy(description, link, selectedFile);
          setError(null);
        } catch (err) {
          setError(
            "Failed to upload image: " +
              (err instanceof Error ? err.message : String(err)),
          );
        } finally {
          setIsUploading(false);
        }
      }
    }
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
              {/* Development helper */}
              {wallet && wallet.chains[0].id === "0xaa37dc" && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => getUSDCMock()}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Get Mock USDC
                </Button>
              )}

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

              {/* Upload method selection */}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button
                  variant="outlined"
                  color={useCustomCID === "upload" ? "primary" : "inherit"}
                  component="label"
                  onClick={() => setUseCustomCID("upload")}
                  startIcon={<CloudUploadIcon />}
                >
                  Upload an image
                  {useCustomCID === "upload" && (
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleFileChange}
                    />
                  )}
                </Button>
                <Button
                  variant="outlined"
                  color={useCustomCID === "cid" ? "primary" : "inherit"}
                  onClick={() => setUseCustomCID("cid")}
                >
                  Use custom IPFS CID
                </Button>
              </Box>

              {/* Conditional rendering based on upload method */}
              {useCustomCID === "cid" ? (
                <TextField
                  label="Enter IPFS CID"
                  variant="outlined"
                  size="small"
                  value={customCID}
                  onChange={(e) => setCustomCID(e.target.value)}
                  fullWidth
                  placeholder="Your CID here"
                  sx={{ mt: 2 }}
                />
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {selectedFile && (
                    <Button
                      size="small"
                      onClick={() => setSelectedFile(null)}
                      sx={{ mt: 2, width: "fit-content" }}
                      endIcon={<CloseIcon sx={{ color: "white" }} />}
                    >
                      <Typography
                        variant="body1"
                        color="#E3E3E3"
                        fontSize="small"
                      >
                        {selectedFile.name}
                      </Typography>
                    </Button>
                  )}
                </Box>
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
                        transactionStatus?.approveUSDC.completed
                          ? 1
                          : 0
                      }
                      orientation="vertical"
                    >
                      <Step
                        completed={
                          (allowance !== null &&
                            allowance >= governanceSettings.price) ||
                          transactionStatus?.approveUSDC.completed
                        }
                      >
                        <StepButton
                          onClick={async () => {
                            if (
                              wallet &&
                              governanceSettings &&
                              !transactionStatus?.approveUSDC.pending &&
                              !transactionStatus?.approveUSDC.completed &&
                              !(
                                allowance !== null &&
                                allowance >= governanceSettings.price
                              )
                            ) {
                              await approveUSDC(
                                governanceSettings.price.toString(),
                              );
                              const newAllowance = await allowanceUSDC();
                              setAllowance(Number(newAllowance));
                            }
                          }}
                          disabled={
                            transactionStatus?.approveUSDC.pending ||
                            transactionStatus?.approveUSDC.completed ||
                            (allowance !== null &&
                              allowance >= governanceSettings.price)
                          }
                        >
                          <StepLabel>
                            <Box>
                              <Typography variant="body2">
                                {transactionStatus?.approveUSDC.label ||
                                  `Approve USDC (${governanceSettings?.price} USDC)`}
                              </Typography>
                              {transactionStatus?.approveUSDC.pending && (
                                <Typography variant="caption" color="primary">
                                  Processing...
                                </Typography>
                              )}
                              {(transactionStatus?.approveUSDC.completed ||
                                (allowance !== null &&
                                  allowance >= governanceSettings.price)) && (
                                <Typography
                                  variant="caption"
                                  color="success.main"
                                >
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
                disabled={
                  (wallet &&
                    ((useCustomCID ? !customCID : !selectedFile) ||
                      !description ||
                      !link ||
                      !!linkError)) ||
                  isUploading
                }
                sx={{ mt: 2 }}
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
              {!useCustomCID && selectedFile && (
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
    </Container>
  );
}
