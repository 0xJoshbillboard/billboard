import { createRoot } from "react-dom/client";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/700.css";
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

const injected = injectedModule();

const onboard = init({
  wallets: [injected],
  chains,
  appMetadata: {
    name: "Web3 Utilities",
    description: "A collection of tools for the web3 ecosystem",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
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
            main: mode === "dark" ? "#ffeb3b" : "#ff5722", // Yellow for dark, Orange-red for light
            light: mode === "dark" ? "#fff176" : "#ff8a65",
            dark: mode === "dark" ? "#ffd600" : "#d84315",
            contrastText: mode === "dark" ? "#000000" : "#ffffff",
          },
          secondary: {
            main: mode === "dark" ? "#ff9800" : "#009688", // Orange for dark, Teal for light
            light: mode === "dark" ? "#ffb74d" : "#4db6ac",
            dark: mode === "dark" ? "#f57c00" : "#00796b",
            contrastText: mode === "dark" ? "#000000" : "#ffffff",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#1e1e1e",
          },
          text: {
            primary: mode === "light" ? "#212121" : "#ffffff",
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
          fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 700,
          },
          button: {
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
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Web3OnboardProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
