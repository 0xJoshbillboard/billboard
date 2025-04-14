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
} from "@mui/material";

export default function SDK() {
  const { getAds } = useBillboard();
  const [ads, setAds] = useState<Billboard[]>([]);

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
  }, [getAds]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack
        direction="row"
        flexWrap="wrap"
        spacing={3}
        sx={{
          "& > *": {
            flexBasis: {
              xs: "100%",
              sm: "calc(50% - 12px)",
              md: "calc(33.333% - 16px)",
            },
          },
          gap: 3,
        }}
      >
        {ads.map((ad) => (
          <Card
            key={ad.ipfsHash}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardMedia
              component="img"
              height="200"
              image={ad.url}
              alt={ad.description}
              sx={{ objectFit: "contain" }}
            />
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {ad.description}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expires: {new Date(ad.expiryTime * 1000).toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
