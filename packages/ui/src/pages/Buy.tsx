import useBillboard from "../hooks/useBillboard";
import { useState } from "react";
import {
  Button,
  Box,
  Typography,
  CircularProgress,
  Switch,
  FormControlLabel,
  TextField,
  Paper,
  Divider,
  Alert,
  Container,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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

  // Hooks
  const { buy, getUSDCMock, governanceSettings } = useBillboard();

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
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, my: 4 }}>
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
              Duration: {governanceSettings?.duration} seconds
            </Typography>
          </>
        )}

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Development helper */}
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => getUSDCMock()}
            sx={{ alignSelf: "flex-start" }}
          >
            Get Mock USDC
          </Button>

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
          <FormControlLabel
            control={
              <Switch
                checked={useCustomCID}
                onChange={(e) => setUseCustomCID(e.target.checked)}
                name="useCustomCID"
              />
            }
            label="Use custom CID instead of uploading"
          />

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

          {/* Submit button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleUpload}
            disabled={
              (useCustomCID ? !customCID : !selectedFile) ||
              !description ||
              !link ||
              !!linkError ||
              isUploading
            }
            sx={{ mt: 2 }}
          >
            {isUploading ? <CircularProgress size={24} /> : "Buy Billboard"}
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
      </Paper>
    </Container>
  );
}
