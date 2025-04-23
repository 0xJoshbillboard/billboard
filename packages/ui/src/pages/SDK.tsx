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
  Link,
  Box,
  Button,
  Divider,
  useTheme,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";

export default function SDK() {
  const { getAds, registerProvider } = useBillboard();
  const [ads, setAds] = useState<Billboard[]>([]);
  const [randomAd, setRandomAd] = useState<Billboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [providerHandle, setProviderHandle] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchingAds = async () => {
      try {
        const fetchedAds = await getAds();
        setAds(fetchedAds);
      } catch (error) {
        console.error("Error fetching ads:", error);
      }
    };
    fetchingAds();
  }, []);

  const showRandomAd = async () => {
    setLoading(true);
    try {
      if (ads.length > 0) {
        const randomIndex = Math.floor(Math.random() * ads.length);
        setRandomAd(ads[randomIndex]);
      }
    } catch (error) {
      console.error("Error showing random ad:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterProvider = async () => {
    if (!providerHandle.trim()) {
      setRegistrationStatus({
        success: false,
        message: "Please enter a provider handle",
      });
      return;
    }

    setLoading(true);
    try {
      await registerProvider(providerHandle);
      setRegistrationStatus({
        success: true,
        message: "Successfully registered as a billboard provider!",
      });
      setProviderHandle("");
    } catch (error: any) {
      setRegistrationStatus({
        success: false,
        message: error.message || "Failed to register as provider",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6, backgroundColor: theme.palette.background.paper }}
    >
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Integrate our SDK to earn USDC
        </Typography>
        <Link
          href="https://www.npmjs.com/package/billboard-sdk"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "block",
            mb: 2,
            color: "primary.main",
            fontWeight: 600,
          }}
        >
          Billboard SDK
        </Link>
      </Box>

      {/* Provider Registration Section */}
      <Box
        sx={{
          mb: 6,
          p: 4,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
          background: `linear-gradient(to right bottom, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: 600,
            position: "relative",
            display: "inline-block",
            "&:after": {
              content: '""',
              position: "absolute",
              bottom: -8,
              left: 0,
              width: 60,
              height: 3,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1,
            },
          }}
        >
          Register as a Billboard Provider
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Join our network of providers and start earning USDC by displaying
          advertisements on your platform.
        </Typography>
        <Stack spacing={3} sx={{ maxWidth: 450, mx: "auto" }}>
          <TextField
            label="Provider Handle"
            value={providerHandle}
            onChange={(e) => setProviderHandle(e.target.value)}
            fullWidth
            placeholder="Enter your unique provider identifier"
            variant="outlined"
            InputProps={{
              sx: { borderRadius: 1.5 },
            }}
          />
          <Button
            variant="contained"
            onClick={handleRegisterProvider}
            disabled={loading}
            sx={{
              py: 1.2,
              fontWeight: 600,
              borderRadius: 1.5,
              textTransform: "none",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
              },
            }}
            startIcon={
              loading ? <CircularProgress size={20} color="inherit" /> : null
            }
          >
            {loading ? "Processing Registration..." : "Register as Provider"}
          </Button>
          {registrationStatus && (
            <Alert
              severity={registrationStatus.success ? "success" : "error"}
              variant="filled"
              sx={{ borderRadius: 1.5 }}
            >
              {registrationStatus.message}
            </Alert>
          )}
        </Stack>
      </Box>

      <Typography
        variant="h4"
        component="h1"
        align="center"
        gutterBottom
        sx={{ mb: 4, fontWeight: 600 }}
      >
        Advertisements
      </Typography>

      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={showRandomAd}
          disabled={loading || ads.length === 0}
          sx={{ mb: 3 }}
        >
          {loading ? "Loading..." : "Show Random Advertisement"}
        </Button>

        {randomAd && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
            <Card
              sx={{
                width: 320,
                height: 380,
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                borderRadius: 2,
                overflow: "hidden",
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
                  image={randomAd.url}
                  alt={randomAd.description}
                  sx={{
                    objectFit: "contain",
                    width: "100%",
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
                  {randomAd.description}
                </Typography>
                <Box sx={{ mt: "auto" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    Expires:{" "}
                    {new Date(randomAd.expiryTime * 1000).toLocaleDateString()}
                  </Typography>
                  <Link
                    href={randomAd.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "inline-block",
                      color: "primary.main",
                      fontWeight: 500,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Visit Website →
                  </Link>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography
        variant="h5"
        component="h2"
        align="center"
        gutterBottom
        sx={{ mb: 4, fontWeight: 600 }}
      >
        All Advertisements
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
          {ads.map((ad) => (
            <Card
              key={ad.ipfsHash.concat(ad.link)}
              sx={{
                width: 320,
                height: 380,
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
                  image={ad.url}
                  alt={ad.description}
                  sx={{
                    objectFit: "contain",
                    width: "100%",
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
                <Box sx={{ mt: "auto" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5 }}
                  >
                    Expires:{" "}
                    {new Date(ad.expiryTime * 1000).toLocaleDateString()}
                  </Typography>
                  <Link
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: "inline-block",
                      color: "primary.main",
                      fontWeight: 500,
                      textDecoration: "none",
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Visit Website →
                  </Link>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Container>
  );
}
