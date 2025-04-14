import { Stack, Typography, Button, Card, CardContent, Box, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useConnectWallet } from '@web3-onboard/react';
import useBillboard from '../hooks/useBillboard';

export default function Dashboard() {
  const [{ wallet }, connect] = useConnectWallet();
  const { governanceSettings, extend, billboards, fetchBillboards } = useBillboard();
  const formatDuration = (seconds: number) => {
    const days = Math.floor(seconds / (60 * 60 * 24));
    return `${days} days`;
  };

  const handleExtend = async (index: number) => {
    try {
      await extend(index);
      await fetchBillboards();
    } catch (error) {
      console.error('Error extending billboard:', error);
    }
  };

  if (!wallet) {
    return (
      <Stack spacing={4} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Your Billboards
        </Typography>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>
            Please connect your wallet to view your billboards
          </Typography>
          <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => connect()}>
            Connect Wallet
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Stack spacing={4} sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Billboards
      </Typography>

      {governanceSettings.price !== null && governanceSettings.duration !== null && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Billboard Information
            </Typography>
            <Typography variant="body1">Price: {governanceSettings.price} USDC</Typography>
            <Typography variant="body1">Duration: {formatDuration(governanceSettings.duration)}</Typography>
          </CardContent>
        </Card>
      )}

      {billboards.length > 0 ? (
        <Stack spacing={2}>
          {billboards.map((billboard, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{billboard.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Link:{' '}
                  <Link href={billboard.link} target="_blank" rel="noopener">
                    {billboard.link}
                  </Link>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expires: {new Date(billboard.expiryTime * 1000).toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  IPFS Hash: {billboard.ipfsHash}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={() => handleExtend(index)}>
                    Extend
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>
            You don't have any billboards yet
          </Typography>
          <Button component={RouterLink} to="/buy" variant="contained" color="primary" sx={{ mt: 2 }}>
            Buy Your First Billboard
          </Button>
        </Box>
      )}
    </Stack>
  );
}
