import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  useTheme,
  Menu,
  MenuItem,
  Container,
  Chip,
} from '@mui/material';
import { Menu as MenuIcon, Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon } from '@mui/icons-material';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { chains } from '../utils/chains';
import BillboardIcon from './Icons/Billboard';
import { menuItems } from '../utils/links';
import useBillboard from '../hooks/useBillboard';

export default function Header({ toggleColorMode }: { toggleColorMode: () => void }) {
  const [, setChain] = useSetChain();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileChainOptions, setShowMobileChainOptions] = useState(false);
  const [chainMenuAnchor, setChainMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const location = useLocation();
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const { usdcBalance } = useBillboard();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChainMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setChainMenuAnchor(event.currentTarget);
  };

  const handleChainMenuClose = (chainId?: string) => {
    if (chainId) {
      setChain({ chainId });
    }
    setChainMenuAnchor(null);
  };

  return (
    <AppBar position="static" sx={{ color: theme.palette.text.primary, boxShadow: 'none' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1440px' }}>
        <Toolbar sx={{ justifyContent: 'space-between', padding: { xs: 0 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <BillboardIcon />
            <Typography ml={1} variant="h6" component="div" sx={{ fontWeight: 'bold' }} color="primary">
              Billboard
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 2,
            }}
          >
            {menuItems.map((item) => (
              <Button
                key={item.text}
                component={Link}
                to={item.path}
                sx={{
                  fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  '&:hover': {
                    color: theme.palette.text.secondary,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                {item.text}
              </Button>
            ))}
            {!!wallet?.accounts[0].address && (
              <>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  {wallet.accounts[0].address.slice(0, 6)}...{wallet.accounts[0].address.slice(-4)}
                </Typography>
                <Chip label={`${usdcBalance} USDC`} color="primary" size="small" sx={{ fontWeight: 'medium' }} />
              </>
            )}
            {wallet?.chains[0].namespace && (
              <Button
                onClick={handleChainMenuOpen}
                sx={{
                  color: theme.palette.text.primary,
                  '&:hover': {
                    color: theme.palette.text.secondary,
                    backgroundColor: 'transparent',
                  },
                }}
              >
                Chain: {parseInt(wallet.chains[0].id, 16)}
              </Button>
            )}
            <Menu anchorEl={chainMenuAnchor} open={Boolean(chainMenuAnchor)} onClose={() => handleChainMenuClose()}>
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
            <Button
              onClick={wallet ? () => disconnect(wallet) : () => connect()}
              sx={{
                '&:hover': {
                  color: theme.palette.text.secondary,
                  backgroundColor: 'transparent',
                },
              }}
              variant="contained"
              color="secondary"
            >
              {connecting ? 'Connecting...' : wallet ? 'Disconnect Wallet' : 'Connect Wallet'}
            </Button>

            <IconButton onClick={toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Box>

          {/* Mobile Menu Icon */}
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              gap: 1,
            }}
          >
            <IconButton onClick={toggleColorMode} color="inherit" sx={{ display: { xs: 'flex', md: 'none' } }}>
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleMenu}
              sx={{ display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Mobile Drawer */}
          <Drawer
            anchor="right"
            open={isMenuOpen}
            onClose={toggleMenu}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                width: 240,
                backgroundColor: theme.palette.background.default,
              },
            }}
          >
            <List>
              {menuItems.map((item) => (
                <ListItem
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={toggleMenu}
                  sx={{
                    backgroundColor: location.pathname === item.path ? theme.palette.action.selected : 'transparent',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    sx={{
                      color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary,
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                    }}
                  />
                </ListItem>
              ))}
              <ListItem
                onClick={() => {
                  wallet ? disconnect(wallet) : connect();
                  toggleMenu();
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    cursor: 'pointer',
                  },
                }}
              >
                <ListItemText
                  primary={connecting ? 'Connecting...' : wallet ? 'Disconnect Wallet' : 'Connect Wallet'}
                />
              </ListItem>

              <ListItem>
                {!!wallet?.accounts[0].address && (
                  <Box>
                    <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                      {wallet.accounts[0].address.slice(0, 6)}...{wallet.accounts[0].address.slice(-4)}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                      {usdcBalance} USDC
                    </Typography>
                  </Box>
                )}
              </ListItem>
              <ListItemButton
                onClick={() => {
                  setShowMobileChainOptions(true);
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                    cursor: 'pointer',
                  },
                }}
              >
                {wallet?.chains[0].namespace && (
                  <ListItemText primary={`Chain: ${parseInt(wallet.chains[0].id, 16)}`} />
                )}
              </ListItemButton>
              <List>
                {showMobileChainOptions &&
                  chains.map((chain) => (
                    <ListItemButton
                      key={chain.id}
                      onClick={() => {
                        handleChainMenuClose(chain.id);
                        setShowMobileChainOptions(false);
                      }}
                      selected={wallet?.chains[0].id === chain.id}
                    >
                      <ListItemText primary={`${chain.label} (${parseInt(chain.id, 16)})`} />
                    </ListItemButton>
                  ))}
              </List>
            </List>
          </Drawer>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
