// src/components/charts/ChartContainer.jsx
import { Paper, Box, Typography } from "@mui/material";

const ChartContainer = ({ 
  title, 
  subtitle, 
  icon, 
  gradient = "linear-gradient(90deg, #646cff, #10b981, transparent)",
  children,
  height = 400 
}) => {
  return (
    <Paper
      sx={{
        p: 4,
        height,
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: gradient,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            background: "linear-gradient(135deg, rgba(100, 108, 255, 0.2), rgba(100, 108, 255, 0.1))",
            color: "#646cff",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "white",
              fontFamily: "'Poppins', sans-serif",
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      
      {children}
    </Paper>
  );
};

export default ChartContainer;