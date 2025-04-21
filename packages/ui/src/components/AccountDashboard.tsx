import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import useBillboard from "../hooks/useBillboard";
import { Button, Chip, Menu, MenuItem, useTheme } from "@mui/material";
import { useState } from "react";
import { chains } from "../utils/chains";

export const AccountDashboard = () => {
  const [{ wallet }] = useConnectWallet();
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

  if (!wallet?.accounts[0].address) return null;

  return (
    <>
      <Button
        onClick={handleAccountMenuOpen}
        sx={{
          color: theme.palette.text.primary,
          "&:hover": {
            color: theme.palette.text.secondary,
            backgroundColor: "transparent",
          },
        }}
      >
        {wallet.accounts[0].address.slice(0, 6)}...
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
