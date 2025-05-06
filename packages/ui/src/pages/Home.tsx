import { Box, Container, Stack, Typography, useTheme } from "@mui/material";
import { Ticker } from "../components/Ticker";

export default function Home() {
  const theme = useTheme();

  return (
    <Container maxWidth={false}>
      <Box
        sx={{
          width: "100%",
          textAlign: "center",
          maxWidth: "1440px",
          margin: "0 auto",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          flexWrap="wrap"
          py={8}
        >
          <Stack
            direction="column"
            spacing={1}
            flex={1}
            alignItems="flex-start"
            position="relative"
            maxWidth="700px"
          >
            <Typography variant="h6" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              Welcome to BILLBOARD
            </Typography>
            <Typography variant="h1" textAlign="start" lineHeight="1">
              TURN VIEWS <br />
              INTO VALUE. <br />
              CRYPTO-FIRST
              <br />
              AD SPACE. <br />
            </Typography>
            <Typography variant="h6" textAlign="start" lineHeight="1">
              Billboard connects crypto-native publishers and advertisers in a
              seamless marketplace for digital ad space.
            </Typography>
          </Stack>
        </Stack>

        <Ticker />

        <Stack
          direction={{ xs: "column", xl: "row" }}
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          {USP_ITEMS.map((item, index) => (
            <USPBox
              key={item.headline}
              {...item}
              isLast={index === USP_ITEMS.length - 1}
            />
          ))}
        </Stack>
      </Box>
    </Container>
  );
}

const USP_ITEMS = [
  {
    headline: "PUBLISHERS: BUY AD SPACE",
    description:
      "Publishers purchase a billboard—an ad placement—through our platform to promote their brand on crypto-focused websites.",
    image: "/assets/publisher.svg",
  },
  {
    headline: "ADVERTISERS: INTEGRATE & EARN",
    description:
      "Advertisers add our SDK to their site or app. Once integrated, they can start earning by displaying ads from publishers.",
    image: "/assets/advertiser.svg",
  },
  {
    headline: "A WIN-WIN SYSTEM",
    description:
      "When a publisher buys ad space, their payment goes directly to the advertiser. This means advertisers are rewarded for hosting ads, and publishers get real exposure.",
    image: "/assets/win-win.svg",
  },
];

const USPBox = ({
  headline,
  description,
  image,
  isLast,
}: {
  headline: string;
  description: string;
  image: string;
  isLast: boolean;
}) => {
  return (
    <Box
      maxWidth="470px"
      minWidth="470px"
      maxHeight="430px"
      minHeight="430px"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      alignItems="center"
      borderRight={{ xs: "none", lg: isLast ? "none" : "1px solid #444" }}
      paddingRight={{ xs: 0, lg: isLast ? 0 : 2 }}
    >
      <Typography variant="h1" fontSize="48px">
        {headline}
      </Typography>
      <img src={image} alt={headline} />
      <Typography variant="h6">{description}</Typography>
    </Box>
  );
};
