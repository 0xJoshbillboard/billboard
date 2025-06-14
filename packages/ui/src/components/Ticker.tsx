import { useTheme } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export const Ticker = () => {
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();

  useEffect(() => {
    const tickerItems = ["BUY NOW", "-", "SELL NOW", "-"];
    const tickerWidth = containerRef.current?.scrollWidth || 0;
    const itemWidth = tickerWidth / tickerItems.length;

    const animate = () => {
      setPosition((prevPosition) => {
        const newPosition = prevPosition - 1;
        return newPosition <= -itemWidth ? 0 : newPosition;
      });
    };

    const animationId = setInterval(animate, 30);
    return () => clearInterval(animationId);
  }, []);

  return (
    <Box
      sx={{
        minWidth: "100%",
        overflow: "hidden",
        backgroundColor: theme.palette.primary.main,
        py: 1,
        my: 3,
      }}
      data-cy="ticker"
    >
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          whiteSpace: "nowrap",
          transform: `translateX(${position}px)`,
        }}
      >
        {Array(10)
          .fill(["BUY NOW", "-", "EARN NOW", "-"])
          .flat()
          .map((item, index) => (
            <Typography
              key={index}
              variant="h6"
              component="span"
              sx={{
                px: 2,
                fontWeight: "bold",
                fontStyle: "italic",
                color: "white",
              }}
              data-cy={`ticker-item-${index}`}
            >
              {item}
            </Typography>
          ))}
      </Box>
    </Box>
  );
};
