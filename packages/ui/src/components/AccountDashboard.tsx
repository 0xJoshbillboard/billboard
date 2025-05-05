import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import useBillboard from "../hooks/useBillboard";
import { Button, Chip, Menu, MenuItem, useTheme } from "@mui/material";
import { useState } from "react";
import { chains } from "../utils/chains";
import { WalletRounded } from "@mui/icons-material";

export const AccountDashboard = () => {
  const [{ wallet }, , disconnect] = useConnectWallet();
  const [, setChain] = useSetChain();
  const { usdcBalance } = useBillboard();
  const theme = useTheme();
  const [chainMenuAnchor, setChainMenuAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [accountMenuAnchor, setAccountMenuAnchor] =
    useState<null | HTMLElement>(null);

  const handleChainMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setChainMenuAnchor(event.currentTarget);
  };

  const handleChainMenuClose = (chainId?: string) => {
    if (chainId) {
      setChain({ chainId });
    }
    setChainMenuAnchor(null);
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountMenuAnchor(null);
  };

  const handleDisconnect = () => {
    if (wallet) {
      disconnect(wallet);
    }
    handleAccountMenuClose();
  };

  if (!wallet?.accounts[0].address) return null;

  return (
    <>
      <Button
        onClick={handleAccountMenuOpen}
        variant="outlined"
        startIcon={<WalletRounded />}
        size="small"
        sx={{
          borderRadius: 2,
          fontWeight: 600,
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            borderColor: theme.palette.primary.main,
          },
          transition: "all 0.3s ease",
        }}
      >
        {wallet.accounts[0].address.slice(0, 4)}...
        {wallet.accounts[0].address.slice(-4)}
      </Button>
      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleAccountMenuClose}
      >
        <MenuItem>
          <Chip
            label={`${usdcBalance} USDC`}
            color="primary"
            size="small"
            sx={{ fontWeight: "medium" }}
          />
        </MenuItem>
        {wallet?.chains[0].namespace && (
          <MenuItem onClick={handleChainMenuOpen}>
            Chain: {parseInt(wallet.chains[0].id, 16)}
          </MenuItem>
        )}
        <MenuItem
          onClick={handleDisconnect}
          sx={{ color: theme.palette.error.main }}
        >
          Disconnect Wallet
        </MenuItem>
      </Menu>
      <Menu
        anchorEl={chainMenuAnchor}
        open={Boolean(chainMenuAnchor)}
        onClose={() => handleChainMenuClose()}
      >
        {chains.map((chain) => (
          <MenuItem
            key={chain.id}
            onClick={() => handleChainMenuClose(chain.id)}
            selected={wallet?.chains[0].id === chain.id}
          >
            {chain.label} ({parseInt(chain.id, 16)})
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
