import { Outlet } from "react-router";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useState, useEffect } from "react";
import { useSetChain } from "@web3-onboard/react";
import Header from "./Header";
import Footer from "./Footer";
import UnsupportedNetwork from "./Modals/UnsupportedNetwork";

export default function Layout({
  onThemeChange,
}: {
  onThemeChange: () => void;
}) {
  const [{ connectedChain }] = useSetChain();
  const [isUnsupportedNetwork, setIsUnsupportedNetwork] = useState(false);
  const theme = useTheme();

  const requiredChainId = 11155420;
  const requiredChainName = "Optimism Sepolia";
  const requiredChainIdHex = `0x${requiredChainId.toString(16)}`;

  useEffect(() => {
    if (connectedChain && connectedChain.id !== requiredChainIdHex) {
      setIsUnsupportedNetwork(true);
    } else {
      setIsUnsupportedNetwork(false);
    }
  }, [connectedChain]);

  const handleCloseNetworkModal = () => {
    setIsUnsupportedNetwork(false);
  };

  return (
    <Stack direction="column" spacing={2} minHeight="100vh" alignItems="center">
      <UnsupportedNetwork
        open={isUnsupportedNetwork}
        onClose={handleCloseNetworkModal}
        requiredChainId={requiredChainId}
        requiredChainName={requiredChainName}
      />
      <Header toggleColorMode={onThemeChange} />
      <Outlet />
      <Footer />
    </Stack>
  );
}
