import { Box, Container, Divider, Link, Stack, Typography, useTheme } from '@mui/material';

export default function Home() {
  const theme = useTheme();
  return (
    <Container maxWidth={false}>
      <Box sx={{ width: '100%', textAlign: 'center', maxWidth: '1440px', margin: '0 auto' }}>
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} flexWrap="wrap" py={8}>
          <img
            src="/assets/billboard-landing-page.png"
            alt="Billboard"
            style={{
              maxWidth: '500px',
              height: 'auto',
              borderRadius: '50%',
              border: `1px solid ${theme.palette.primary.main}`,
              flex: 2,
            }}
          />
          <Stack direction="column" spacing={1} flex={1}>
            <Typography variant="h1" color="primary">
              Billboard
            </Typography>
            <Typography variant="h5">Reach with your ads the right audience</Typography>
            <Divider sx={{ width: '100%', backgroundColor: theme.palette.primary.main }} />
            <Typography variant="body1">
              Upload your ad to IPFS via our <Link href="/sdk">SDK</Link> and get displayed on different billboards
              across the world.
            </Typography>
          </Stack>
        </Stack>
        <Divider sx={{ width: '100%', backgroundColor: theme.palette.primary.main, marginY: 4 }} />
        <Stack direction="column" justifyContent="center" flexWrap="wrap">
          <Typography variant="h2">How it works</Typography>
          <Typography variant="body1">
            There are two parties. The <HighlightedText>publisher</HighlightedText> and the{' '}
            <HighlightedText>advertiser</HighlightedText>.
          </Typography>
          <Typography variant="body1">
            The <HighlightedText>publisher</HighlightedText> is the owner of a billboard. The{' '}
            <HighlightedText>advertiser</HighlightedText> is the one who wants to display their ad on the billboard.
          </Typography>
          <Typography variant="body1">
            With the currency that the <HighlightedText>publisher</HighlightedText> paid, we will forward it to the{' '}
            <HighlightedText>advertiser</HighlightedText>, so the <HighlightedText>advertiser</HighlightedText> is
            incentivized to display their ad on their end.
          </Typography>
          <Typography variant="body1">
            The <HighlightedText>publisher</HighlightedText> can buy a billboard on our{' '}
            <Link href="/buy" fontWeight="bold">
              platform
            </Link>
            .
          </Typography>
          <Typography variant="body1">
            The <HighlightedText>advertiser</HighlightedText> can integrate our{' '}
            <Link
              href="https://www.npmjs.com/package/billboard-sdk?activeTab=readme"
              rel="noopener noreferrer"
              target="_blank"
              fontWeight="bold"
            >
              SDK
            </Link>{' '}
            and start earn money right away.
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}

const HighlightedText = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  return (
    <Typography component="span" sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
      {children}
    </Typography>
  );
};
