import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Box,
  useTheme,
  Container,
  Divider,
} from "@mui/material";
import { Menu as MenuIcon, KeyboardArrowDown } from "@mui/icons-material";
import { useConnectWallet, useSetChain } from "@web3-onboard/react";
import { chains } from "../utils/chains";
import BillboardIcon from "./Icons/Billboard";
import { menuItems } from "../utils/links";
import { AccountDashboard } from "./AccountDashboard";

export default function Header(
  {
    // toggleColorMode,
  }: {
    toggleColorMode: () => void;
  },
) {
  const [, setChain] = useSetChain();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMobileChainOptions, setShowMobileChainOptions] = useState(false);
  const theme = useTheme();
  const location = useLocation();
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleChainMenuClose = (chainId?: string) => {
    if (chainId) {
      setChain({ chainId });
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        height: "100px",
        borderBottom: "1px solid #444",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1440px",
          height: "100px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Box
          component={Link}
          to="/"
          borderRight={{ xs: "none", md: "1px solid #444" }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100%"
          data-testid="header-logo"
        >
          <BillboardIcon />
        </Box>

        {/* Desktop Navigation */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            alignItems: "center",
            gap: 3,
          }}
        >
          {menuItems.map((item) =>
            item.external ? (
              <Button
                key={item.text}
                data-testid={`header-button-${item.text}`}
                component="a"
                href={item.path}
                target="_blank"
                rel="noopener noreferrer"
                size="large"
                sx={{
                  fontWeight: 500,
                  position: "relative",
                  color: theme.palette.text.primary,
                }}
              >
                {item.text}
              </Button>
            ) : (
              <Button
                key={item.text}
                component={Link}
                data-testid={`header-button-${item.text}`}
                to={item.path}
                size="large"
                sx={{
                  fontWeight: 500,
                  position: "relative",
                  color: theme.palette.text.primary,
                }}
              >
                {item.text}
              </Button>
            ),
          )}

          {/* TODO @dev reacive once we have two palettes */}
          {/* <IconButton
              onClick={toggleColorMode}
              color="inherit"
              sx={{
                ml: 1,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.04)"
                    : "rgba(255, 255, 255, 0.08)",
                "&:hover": {
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? "rgba(0, 0, 0, 0.08)"
                      : "rgba(255, 255, 255, 0.12)",
                },
              }}
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton> */}
        </Box>

        <Box
          borderLeft={{ xs: "none", md: "1px solid #444" }}
          p={4}
          height="100%"
        >
          {!wallet && (
            <Button
              onClick={() => connect()}
              variant="contained"
              size="small"
              sx={{
                color: "white",
              }}
            >
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}

          {!!wallet?.accounts[0].address && (
            <Box sx={{ ml: 1 }}>
              <AccountDashboard />
            </Box>
          )}
        </Box>

        {/* Mobile Menu Icon */}
        <Box
          sx={{
            display: { xs: "flex", md: "none" },
            gap: 1,
            alignItems: "center",
          }}
        >
          {/* <IconButton
              onClick={toggleColorMode}
              color="inherit"
              sx={{
                backgroundColor:
                  theme.palette.mode === "light"
                    ? "rgba(0, 0, 0, 0.04)"
                    : "rgba(255, 255, 255, 0.08)",
              }}
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton> */}

          <IconButton
            edge="end"
            color="inherit"
            aria-label="menu"
            onClick={toggleMenu}
            sx={{
              ml: 1,
              backgroundColor:
                theme.palette.mode === "light"
                  ? "rgba(0, 0, 0, 0.04)"
                  : "rgba(255, 255, 255, 0.08)",
            }}
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
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 280,
              backgroundColor: theme.palette.background.paper,
              boxShadow: 3,
            },
          }}
        >
          <Box sx={{ p: 3, display: "flex", alignItems: "center" }}>
            <BillboardIcon />
          </Box>

          <List sx={{ px: 1 }}>
            {menuItems.map((item) => (
              <ListItem
                key={item.text}
                component={item.external ? "a" : Link}
                to={!item.external ? item.path : undefined}
                href={item.external ? item.path : undefined}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={toggleMenu}
                disablePadding
              >
                <ListItemButton
                  data-testid={`header-button-${item.text}`}
                  sx={{
                    py: 1.5,
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor:
                      !item.external && location.pathname === item.path
                        ? theme.palette.action.selected
                        : "transparent",
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight:
                        !item.external && location.pathname === item.path
                          ? 600
                          : 400,
                      color:
                        !item.external && location.pathname === item.path
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}

            <Divider sx={{ my: 2 }} />

            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  wallet ? disconnect(wallet) : connect();
                  toggleMenu();
                }}
                sx={{
                  py: 1.5,
                  borderRadius: 1,
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              >
                <ListItemText
                  primary={
                    connecting
                      ? "Connecting..."
                      : wallet
                        ? "Disconnect Wallet"
                        : "Connect Wallet"
                  }
                  primaryTypographyProps={{
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                />
              </ListItemButton>
            </ListItem>

            {wallet?.chains[0].namespace && (
              <>
                <ListItemButton
                  onClick={() => {
                    setShowMobileChainOptions(!showMobileChainOptions);
                  }}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={`Current Chain: ${parseInt(wallet.chains[0].id, 16)}`}
                    primaryTypographyProps={{
                      fontWeight: 500,
                    }}
                  />
                  <KeyboardArrowDown />
                </ListItemButton>

                {showMobileChainOptions && (
                  <Box sx={{ ml: 2, mt: 1, mb: 2 }}>
                    {chains.map((chain) => (
                      <ListItemButton
                        key={chain.id}
                        onClick={() => {
                          handleChainMenuClose(chain.id);
                          setShowMobileChainOptions(false);
                          toggleMenu();
                        }}
                        selected={wallet?.chains[0].id === chain.id}
                        sx={{
                          py: 1,
                          borderRadius: 1,
                          mb: 0.5,
                          pl: 2,
                        }}
                      >
                        <ListItemText
                          primary={`${chain.label} (${parseInt(chain.id, 16)})`}
                          primaryTypographyProps={{
                            fontWeight:
                              wallet?.chains[0].id === chain.id ? 600 : 400,
                            fontSize: "0.875rem",
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </Box>
                )}
              </>
            )}
          </List>
        </Drawer>
      </Container>
    </AppBar>
  );
}
