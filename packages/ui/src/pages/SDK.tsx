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
} from "@mui/material";

export default function SDK() {
  const { getAds } = useBillboard();
  const [ads, setAds] = useState<Billboard[]>([]);
  const [randomAd, setRandomAd] = useState<Billboard | null>(null);
  const [loading, setLoading] = useState(false);
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

  return (
    <Container
      maxWidth="lg"
      sx={{ py: 6, backgroundColor: theme.palette.background.paper }}
    >
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
