import useBillboard from "../hooks/useBillboard";
import { useEffect, useState } from "react";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  FormControlLabel,
  TextField,
  Paper,
  Divider,
  Alert,
  Container,
  Radio,
  RadioGroup,
  Stepper,
  Step,
  StepLabel,
  StepButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useConnectWallet } from "@web3-onboard/react";

export default function Buy() {
  // State management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useCustomCID, setUseCustomCID] = useState(false);
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
    <Container maxWidth="md">
      <Box sx={{ p: 4, my: 4 }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
          Buy Billboard
        </Typography>
        {governanceSettings.price && governanceSettings.duration && (
          <>
            <Typography
              variant="body1"
              gutterBottom
              align="center"
              sx={{ mb: 3 }}
            >
              Price: {governanceSettings?.price} USDC
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              align="center"
              sx={{ mb: 3 }}
            >
              Duration: {Math.floor(governanceSettings?.duration / 86400)} days
            </Typography>
          </>
        )}

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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

          {/* Form fields */}
          <TextField
            label="Description"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="Enter a description for your billboard"
            required
          />

          <TextField
            label="Link"
            variant="outlined"
            value={link}
            onChange={handleLinkChange}
            fullWidth
            placeholder="Enter a URL (e.g., https://example.com)"
            required
            error={!!linkError}
            helperText={linkError}
          />

          {/* Upload method selection */}
          <RadioGroup
            value={useCustomCID ? "customCID" : "uploadImage"}
            onChange={(e) => setUseCustomCID(e.target.value === "customCID")}
          >
            <FormControlLabel
              value="uploadImage"
              control={<Radio />}
              label="Upload an image"
            />
            <FormControlLabel
              value="customCID"
              control={<Radio />}
              label="Use custom IPFS CID"
            />
          </RadioGroup>

          {/* Conditional rendering based on upload method */}
          {useCustomCID ? (
            <TextField
              label="Enter IPFS CID"
              variant="outlined"
              value={customCID}
              onChange={(e) => setCustomCID(e.target.value)}
              fullWidth
              placeholder="Your CID here"
            />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadIcon />}
                disabled={isUploading}
                sx={{ alignSelf: "flex-start" }}
              >
                Select Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>

              {selectedFile && (
                <Typography variant="body2" color="text.secondary">
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
          )}

          {/* Transaction steps */}
          <Box sx={{ mt: 3, mb: 2 }}>
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
                  sx={{ mb: 2 }}
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
              sx={{ mt: 3, p: 2, border: "1px solid #eee", borderRadius: 2 }}
            >
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
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
                sx={{ mt: 1, color: "text.secondary", wordBreak: "break-all" }}
              >
                File: {selectedFile.name}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
}
