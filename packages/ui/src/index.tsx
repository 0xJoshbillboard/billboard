import { createRoot } from "react-dom/client";
import React, { useMemo, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import { createTheme, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import injectedModule from "@web3-onboard/injected-wallets";
import { init, Web3OnboardProvider } from "@web3-onboard/react";
import { chains } from "./utils/chains";
import Layout from "./components/Layout";
import Buy from "./pages/Buy";
import SDK from "./pages/SDK";
import Dashboard from "./pages/Dashboard";
import Governance from "./pages/Governance";
import "./index.css";
import { OnboardBillboard } from "./components/Icons/OnboardBillboard";

const injected = injectedModule();

const onboard = init({
  wallets: [injected],
  chains,
  appMetadata: {
    name: "Billboard",
    description: "Save your ad space on the Billboard",
    icon: OnboardBillboard,
  },
  accountCenter: {
    desktop: {
      enabled: false,
    },
    mobile: {
      enabled: false,
    },
  },
});

function App() {
  const [mode, setMode] = useState<"light" | "dark">(
    !localStorage.getItem("theme")
      ? "dark"
      : localStorage.getItem("theme") === "dark"
        ? "dark"
        : "light",
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: mode === "dark" ? "#F37021" : "#ff5722",
            light: mode === "dark" ? "#F37021" : "#ff8a65",
            dark: mode === "dark" ? "#F37021" : "#d84315",
            contrastText: mode === "dark" ? "#000000" : "#ffffff",
          },
          secondary: {
            main: mode === "dark" ? "#ff9800" : "#009688",
            light: mode === "dark" ? "#ffb74d" : "#4db6ac",
            dark: mode === "dark" ? "#f57c00" : "#00796b",
            contrastText: mode === "dark" ? "#000000" : "#ffffff",
          },
          background: {
            default: mode === "light" ? "#1E1E1E" : "#1E1E1E",
            paper: mode === "light" ? "#1E1E1E" : "#1E1E1E",
          },
          text: {
            primary: mode === "light" ? "#FFFFFF" : "#ffffff",
            secondary: mode === "light" ? "#757575" : "#b0b0b0",
          },
          divider:
            mode === "light"
              ? "rgba(0, 0, 0, 0.12)"
              : "rgba(255, 255, 255, 0.12)",
          error: {
            main: "#f44336",
          },
          warning: {
            main: "#ff9800",
          },
          info: {
            main: mode === "light" ? "#2196f3" : "#29b6f6",
          },
          success: {
            main: "#4caf50",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                textTransform: "none",
                fontWeight: 600,
                color: "white",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow:
                  mode === "light"
                    ? "0px 2px 4px rgba(0, 0, 0, 0.1)"
                    : "0px 2px 4px rgba(0, 0, 0, 0.4)",
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                margin: "16px 0",
              },
            },
          },
        },
        typography: {
          fontFamily:
            '"FuturaCondensedPT-Medium", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 800,
          },
          h2: {
            fontWeight: 700,
          },
          h6: {
            fontFamily: "FuturaPT-Book",
            fontWeight: 400,
          },
          body1: {
            fontFamily: "FuturaPT-Medium",
            fontWeight: 400,
          },
          button: {
            fontFamily: "FuturaPT-Medium",
            fontWeight: 600,
          },
        },
      }),
    [mode],
  );

  return (
    <Web3OnboardProvider web3Onboard={onboard}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <Layout
                  onThemeChange={() => {
                    setMode(mode === "light" ? "dark" : "light");
                    localStorage.setItem(
                      "theme",
                      mode === "light" ? "dark" : "light",
                    );
                  }}
                />
              }
            >
              <Route index element={<Home />} />
              <Route path="buy" element={<Buy />} />
              <Route path="sdk" element={<SDK />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="governance" element={<Governance />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Web3OnboardProvider>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
