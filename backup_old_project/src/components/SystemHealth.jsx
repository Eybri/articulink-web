import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Dns,
  AutoAwesome,
  GraphicEq,
  Storage as StorageIcon,
} from "@mui/icons-material";
import { dashboardAPI } from "../api/api";

const SystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      setRefreshing(true);
      const data = await dashboardAPI.getSystemHealth();
      setHealthData(data);
    } catch (error) {
      console.error("Failed to fetch system health:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchHealth, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 180,
        }}
      >
        <CircularProgress size={24} sx={{ color: "#646cff" }} />
      </Paper>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "connected":
      case "online":
      case "configured":
        return <CheckCircle sx={{ color: "#10b981", fontSize: 20 }} />;
      case "degraded":
      case "local_only":
      case "offline":
        return <Warning sx={{ color: "#f59e0b", fontSize: 20 }} />;
      case "error":
      case "down":
      case "missing_config":
        return <Error sx={{ color: "#ef4444", fontSize: 20 }} />;
      default:
        return <Warning sx={{ color: "#f59e0b", fontSize: 20 }} />;
    }
  };

  const getOverallStatusColor = (status) => {
    switch (status) {
      case "optimal": return "#10b981";
      case "degraded": return "#f59e0b";
      case "down": return "#ef4444";
      default: return "#f59e0b";
    }
  };

  const serviceItems = [
    { name: "Main Database", key: "database", icon: <Dns />, color: "#646cff" },
    { name: "Gemini AI (Chat/Analysis)", key: "gemini", icon: <AutoAwesome />, color: "#10b981" },
    { name: "Whisper ASR (Audio)", key: "whisper", icon: <GraphicEq />, color: "#f59e0b" },
    { name: "Storage (Supabase)", key: "storage", icon: <StorageIcon />, color: "#ef4444" },
  ];

  return (
    <Paper
      sx={{
        p: 3,
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 3,
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "0.85rem",
              color: "white",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: 1.5
            }}
          >
            System & Model Health
            <Box 
              sx={{ 
                px: 1, 
                py: 0.25, 
                borderRadius: 1, 
                fontSize: "0.6rem", 
                bgcolor: `${getOverallStatusColor(healthData?.status)}20`,
                color: getOverallStatusColor(healthData?.status),
                border: `1px solid ${getOverallStatusColor(healthData?.status)}40`,
                textTransform: "uppercase"
              }}
            >
              {healthData?.status}
            </Box>
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", mt: 0.5 }}>
            Real-time status of ArticuLink infrastructure
          </Typography>
        </Box>
        <Tooltip title="Refresh Health Status">
          <IconButton 
            onClick={fetchHealth} 
            disabled={refreshing}
            sx={{ 
              color: "rgba(255,255,255,0.5)",
              "&:hover": { color: "#646cff", bgcolor: "rgba(100, 108, 255, 0.1)" }
            }}
          >
            <Refresh sx={{ fontSize: 18, animation: refreshing ? "spin 1s linear infinite" : "none" }} />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        {serviceItems.map((service) => {
          const statusEntry = healthData?.services[service.key];
          return (
            <Grid item xs={12} sm={6} key={service.key}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5
                }}
              >
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    bgcolor: `${service.color}15`,
                    color: service.color,
                    display: "flex"
                  }}
                >
                  {service.icon}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ color: "white", fontSize: "0.75rem", fontWeight: 600 }}>
                    {service.name}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.65rem", noWrap: true }}>
                    {statusEntry?.status === "connected" || statusEntry?.status === "online" || statusEntry?.status === "configured"
                      ? statusEntry?.mode || statusEntry?.model || "Operational"
                      : statusEntry?.detail || "Configuration required"}
                  </Typography>
                </Box>
                {getStatusIcon(statusEntry?.status)}
              </Box>
            </Grid>
          );
        })}
      </Grid>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Paper>
  );
};

export default SystemHealth;
