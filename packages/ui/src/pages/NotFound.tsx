import { Box, Typography } from "@mui/material";

const NotFound = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <Typography variant="h1" sx={{ fontSize: "4rem", mb: 2 }}>
        404
      </Typography>
      <Typography variant="h4">Page not found</Typography>
    </Box>
  );
};
export default NotFound;
