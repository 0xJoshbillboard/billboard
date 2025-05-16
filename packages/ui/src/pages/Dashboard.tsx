import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useConnectWallet } from "@web3-onboard/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import useBillboard from "../hooks/useBillboard";
import { BillboardStatistic, RawBillboard } from "../utils/types";

export default function Dashboard() {
  const [{ wallet }, connect] = useConnectWallet();
  const {
    governanceSettings,
    extend,
    fetchBillboards,
    contract,
    getStatistics,
  } = useBillboard();
  const [billboards, setBillboards] = useState<RawBillboard[]>([]);
  const [statistics, setStatistics] = useState<BillboardStatistic[]>([]);
  const [billboardsAreLoading, setBillboardsAreLoading] = useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (wallet && contract) {
      const fetchingBillboards = async () => {
        setBillboardsAreLoading(true);
        setStatisticsLoading(true);
        try {
          const fetchedBillboards = await fetchBillboards();
          const userBillboards = fetchedBillboards.filter(
            (billboard) =>
              billboard.owner.toLowerCase() ===
              wallet.accounts[0].address.toLowerCase(),
          );

          const stats = await getStatistics(
            userBillboards.map((billboard) => billboard.owner),
          );
          setStatistics(stats);
          setBillboards(fetchedBillboards);
        } catch (error) {
          console.error("Error fetching billboards:", error);
        } finally {
          setBillboardsAreLoading(false);
          setStatisticsLoading(false);
        }
      };
      fetchingBillboards();
    }
  }, [wallet, contract]);

  const handleExtend = async (index: number) => {
    try {
      await extend(index);
      const fetchedBillboards = await fetchBillboards();
      setBillboards(fetchedBillboards);
    } catch (error) {
      console.error("Error extending billboard:", error);
    }
  };

  // Prepare data for charts
  const prepareVisitorData = () => {
    const visitorsByDate = statistics.reduce(
      (acc, stat) => {
        const date = new Date(stat.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(visitorsByDate).map(([date, count]) => ({
      date,
      visitors: count,
    }));
  };

  const prepareBrowserData = () => {
    const browsers = statistics.reduce(
      (acc, stat) => {
        if (stat.userAgent) {
          let browser = "Unknown";
          if (stat.userAgent.includes("Chrome")) browser = "Chrome";
          else if (stat.userAgent.includes("Firefox")) browser = "Firefox";
          else if (stat.userAgent.includes("Safari")) browser = "Safari";
          else if (stat.userAgent.includes("Edge")) browser = "Edge";

          acc[browser] = (acc[browser] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    return Object.entries(browsers).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (!wallet) {
    return (
      <Stack spacing={4} sx={{ p: 3 }}>
        <Box textAlign="center" py={4}>
          <Typography variant="h6" gutterBottom>
            Please connect your wallet to view your billboards
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, color: "white" }}
            onClick={() => connect()}
          >
            Connect Wallet
          </Button>
        </Box>
      </Stack>
    );
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: "1440px" }}>
      <Box sx={{ p: 4, my: 4 }}>
        <Typography variant="h1">Your Billboards</Typography>
        <Typography variant="h6"></Typography>
      </Box>
      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={16}
        justifyContent="space-between"
        alignItems={{ xs: "center", lg: "flex-start" }}
        mt={8}
      >
        <Box
          component="img"
          width="100%"
          style={{ maxWidth: "400px" }}
          height="auto"
          src="../assets/win-win.svg"
          alt="Billboard"
        />
        <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            {billboardsAreLoading ? (
              <CircularProgress />
            ) : billboards.length > 0 ? (
              billboards.map((billboard, index) => (
                <Card
                  key={billboard.ipfsHash.concat(billboard.link)}
                  onClick={() => {
                    window.open(
                      billboard.link,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  sx={{
                    cursor: "pointer",
                    width: 320,
                    height: "auto",
                    padding: 2,
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.3s, box-shadow 0.3s",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    borderRadius: 2,
                    overflow: "hidden",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 200,
                      backgroundColor: theme.palette.grey[100],
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="200"
                      image={`https://plum-main-eagle-917.mypinata.cloud/ipfs/${billboard.ipfsHash}`}
                      alt={billboard.description}
                      sx={{
                        objectFit: "cover",
                        width: "100%",
                        background: theme.palette.background.default,
                      }}
                    />
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: 3,
                    }}
                  >
                    <Typography variant="body1">
                      Description: {billboard.description}
                    </Typography>
                    <Typography variant="body1">
                      Expiry:{" "}
                      {new Date(billboard.expiryTime * 1000).toLocaleString()}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body1">
                        IPFS Hash: {billboard.ipfsHash.slice(0, 6)}...
                        {billboard.ipfsHash.slice(-4)}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(billboard.ipfsHash);
                        }}
                        sx={{ ml: 1 }}
                        aria-label="Copy IPFS hash"
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      variant="contained"
                      onClick={() => handleExtend(index)}
                    >
                      Extend until{" "}
                      {new Date(
                        (Date.now() / 1000 + governanceSettings.duration) *
                          1000,
                      ).toLocaleString()}
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              <Stack
                spacing={2}
                width="100%"
                direction="column"
                alignItems="center"
                justifyContent="center"
                mt={4}
              >
                <Typography variant="h4" fontWeight={600}>
                  No billboards found
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    navigate("/buy");
                  }}
                >
                  Buy Billboards
                </Button>
              </Stack>
            )}
          </Box>
        </Box>
      </Stack>
      <Stack direction="column" spacing={4} sx={{ p: 4, mt: 6 }}>
        <Typography variant="h1">Statistics</Typography>
        {statisticsLoading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : statistics.length > 0 ? (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Visitor Overview
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  Total Visitors: {statistics.length}
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={prepareVisitorData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <XAxis dataKey="date" angle={-45} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Bar
                        dataKey="visitors"
                        fill={theme.palette.primary.main}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 3, borderRadius: 2, height: "100%" }}
              >
                <Typography variant="h5" gutterBottom>
                  Browser Distribution
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={prepareBrowserData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {prepareBrowserData().map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 3, borderRadius: 2, height: "100%" }}
              >
                <Typography variant="h5" gutterBottom>
                  Visitor Details
                </Typography>
                <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                  {statistics.slice(0, 10).map((stat, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Time: {new Date(stat.timestamp).toLocaleString()}
                      </Typography>
                      {stat.ip && (
                        <Typography variant="body2" color="text.secondary">
                          IP: {stat.ip}
                        </Typography>
                      )}
                      {stat.userAgent && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          User Agent: {stat.userAgent.substring(0, 50)}...
                        </Typography>
                      )}
                      <Divider sx={{ mt: 1 }} />
                    </Box>
                  ))}
                  {statistics.length > 10 && (
                    <Typography variant="body2" textAlign="center">
                      + {statistics.length - 10} more entries
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              No statistics available yet. Statistics will appear when your
              billboards receive visitors.
            </Typography>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
