import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button, 
  Typography,
  Box
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useConnectWallet } from '@web3-onboard/react';

interface UnsupportedNetworkProps {
  open: boolean;
  onClose: () => void;
  requiredChainId: number;
  requiredChainName: string;
}

const UnsupportedNetwork: React.FC<UnsupportedNetworkProps> = ({
  open,
  onClose,
  requiredChainId,
  requiredChainName
}) => {
  const [{ wallet }] = useConnectWallet();
console.log(requiredChainId, requiredChainName)
  const handleSwitchNetwork = async () => {
    if (!wallet) return;
    
    try {
      await wallet.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${requiredChainId.toString(16)}` }]
      });
      onClose();
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <Dialog
      open={open}
      disableEscapeKeyDown
      aria-labelledby="unsupported-network-title"
      aria-describedby="unsupported-network-description"
      maxWidth="sm"
      fullWidth
      onClose={(event, reason) => {
        if (reason === 'backdropClick') {
          return;
        }
      }}
    >
      <DialogTitle id="unsupported-network-title">
        <Box display="flex" alignItems="center" gap={1}>
          <ErrorOutlineIcon color="error" />
          <Typography variant="h6">Wrong Network Detected</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="unsupported-network-description">
          You are currently connected to an unsupported network. This application requires you to connect to the {requiredChainName} network to function properly.
        </DialogContentText>
        <Box mt={2} p={2} bgcolor="action.hover" borderRadius={1}>
          <Typography variant="body2">
            Please switch your wallet to the {requiredChainName} network to continue using this application.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSwitchNetwork} variant="contained" color="primary" autoFocus fullWidth>
          Switch to {requiredChainName}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnsupportedNetwork;
