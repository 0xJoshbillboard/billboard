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
            main: mode === "dark" ? "#ffeb3b" : "#ffc107",
          },
          secondary: {
            main: mode === "dark" ? "#ff9800" : "#ff9800",
          },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
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
