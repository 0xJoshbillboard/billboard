import {
  Stack,
  Typography,
  Button,
  Box,
  Container,
  useTheme,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
} from "@mui/material";
import { useConnectWallet } from "@web3-onboard/react";
import useBillboard, { RawBillboard } from "../hooks/useBillboard";
import { useEffect, useState } from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [{ wallet }, connect] = useConnectWallet();
  const { governanceSettings, extend, fetchBillboards } = useBillboard();
  const [billboards, setBillboards] = useState<RawBillboard[]>([]);
  const [billboardsAreLoading, setBillboardsAreLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet) {
      const fetchingBillboards = async () => {
        setBillboardsAreLoading(true);
        try {
          const fetchedBillboards = await fetchBillboards();
          setBillboards(fetchedBillboards);
        } catch (error) {
          console.error("Error fetching billboards:", error);
        } finally {
          setBillboardsAreLoading(false);
        }
      };
      fetchingBillboards();
    }
  }, [wallet]);

  const handleExtend = async (index: number) => {
    try {
      await extend(index);
      const fetchedBillboards = await fetchBillboards();
      setBillboards(fetchedBillboards);
    } catch (error) {
      console.error("Error extending billboard:", error);
    }
  };

  if (!wallet) {
    return (
      <Stack spacing={4} sx={{ p: 3 }}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>
            Please connect your wallet to view your billboards
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, color: "white" }}
            onClick={() => connect()}
          >
            Connect Wallet
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: "1440px" }}>
      <Box sx={{ p: 4, my: 4 }}>
        <Typography variant="h1">Your Billboards</Typography>
        <Typography variant="h6"></Typography>
      </Box>
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
          src="../assets/win-win.svg"
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
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {billboardsAreLoading ? (
              <CircularProgress />
            ) : billboards.length > 0 ? (
              billboards.map((billboard, index) => (
                <Card
                  key={billboard.ipfsHash.concat(billboard.link)}
                  onClick={() => {
                    window.open(
                      billboard.link,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  sx={{
                    cursor: "pointer",
                    width: 320,
                    height: "auto",
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
                      image={`https://ipfs.io/ipfs/${billboard.ipfsHash}`}
                      alt={billboard.description}
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
                    <Typography variant="body1">
                      Description: {billboard.description}
                    </Typography>
                    <Typography variant="body1">
                      Expiry:{" "}
                      {new Date(billboard.expiryTime * 1000).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1">
                        IPFS Hash: {billboard.ipfsHash.slice(0, 6)}...
                        {billboard.ipfsHash.slice(-4)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(billboard.ipfsHash);
                        }}
                        sx={{ ml: 1 }}
                        aria-label="Copy IPFS hash"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      onClick={() => handleExtend(index)}
                    >
                      Extend until{" "}
                      {new Date(
                        (Date.now() / 1000 + governanceSettings.duration) *
                          1000,
                      ).toLocaleString()}
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <>
                <Typography variant="h6">No billboards found</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    navigate("/buy");
                  }}
                >
                  Buy Billboards
                </Button>
              </>
            )}
          </Box>
        </Stack>
      </Stack>
    </Container>
  );
}
