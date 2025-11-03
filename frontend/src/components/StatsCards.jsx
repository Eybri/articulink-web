// src/components/StatsCards.jsx
import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress
} from "@mui/material"
import { 
  People, 
  AdminPanelSettings, 
  Person, 
  Schedule,
  TrendingUp,
  TrendingDown
} from "@mui/icons-material"

const StatsCards = ({ 
  stats, 
  loading = false 
}) => {
  const cards = [
    {
      key: 'total_users',
      title: 'Total Users',
      value: stats?.total_users || 0,
      change: '+12%',
      trend: 'up',
      icon: People,
      color: '#646cff',
      progress: 100
    },
    {
      key: 'admins',
      title: 'Administrators',
      value: stats?.by_role?.admin || 0,
      change: '+5%',
      trend: 'up',
      icon: AdminPanelSettings,
      color: '#ef4444',
      progress: stats?.total_users ? Math.round((stats.by_role?.admin / stats.total_users) * 100) : 0
    },
    {
      key: 'active_users',
      title: 'Active Users',
      value: stats?.by_status?.active || 0,
      change: '+8%',
      trend: 'up',
      icon: Person,
      color: '#10b981',
      progress: stats?.total_users ? Math.round((stats.by_status?.active / stats.total_users) * 100) : 0
    },
    {
      key: 'temp_deactivated',
      title: 'Temp Deactivated',
      value: stats?.by_deactivation_type?.temporary || 0,
      change: '-3%',
      trend: 'down',
      icon: Schedule,
      color: '#f59e0b',
      progress: stats?.total_users ? Math.round((stats.by_deactivation_type?.temporary / stats.total_users) * 100) : 0
    }
  ]

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} lg={3} key={card.key}>
          <Card
            sx={{
              height: 160, // Reduced height
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 3, // Slightly smaller border radius
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-4px) scale(1.01)", // Reduced hover effect
                boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 30px ${card.color}20`,
                border: `1px solid ${card.color}40`,
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: `linear-gradient(90deg, ${card.color}, transparent)`,
              },
            }}
          >
            <CardContent sx={{ 
              p: 3, // Reduced padding
              height: "100%", 
              display: "flex", 
              flexDirection: "column", 
              position: "relative",
              '&:last-child': { pb: 2 } 
            }}>
              {loading && (
                <LinearProgress 
                  sx={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    right: 0,
                    bgcolor: "rgba(255,255,255,0.1)",
                    "& .MuiLinearProgress-bar": { bgcolor: card.color }
                  }} 
                />
              )}
              
              <Box sx={{ 
                display: "flex", 
                alignItems: "flex-start", 
                justifyContent: "space-between", 
                mb: 1.5 // Reduced margin
              }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1, // Reduced margin
                      fontWeight: 500,
                      fontSize: "0.8rem", // Slightly smaller font
                      fontFamily: "'Inter', sans-serif",
                      color: "rgba(255, 255, 255, 0.7)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      mb: 0.5, // Reduced margin
                      color: "white",
                      fontFamily: "'Poppins', sans-serif",
                      lineHeight: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      fontSize: { xs: '1.5rem', sm: '1.75rem' } // Responsive font size
                    }}
                  >
                    {loading ? "..." : card.value.toLocaleString()}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5, // Reduced padding
                    borderRadius: 2, // Smaller border radius
                    background: `linear-gradient(135deg, ${card.color}20, ${card.color}10)`,
                    color: card.color,
                    flexShrink: 0,
                    ml: 1.5, // Reduced margin
                    boxShadow: `0 4px 16px ${card.color}30`, // Reduced shadow
                  }}
                >
                  <card.icon sx={{ fontSize: '1.25rem' }} /> {/* Smaller icon */}
                </Box>
              </Box>
              
              <Box sx={{ mt: "auto" }}>
                <Box sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 0.75, // Reduced gap
                  mb: 1 
                }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: card.trend === "up" ? "#10b981" : "#ef4444",
                      fontWeight: 700,
                      fontSize: "0.75rem", // Smaller font
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {card.change} from last month
                  </Typography>
                  {card.trend === "up" ? (
                    <TrendingUp sx={{ color: "#10b981", fontSize: 14 }} /> // Smaller icon
                  ) : (
                    <TrendingDown sx={{ color: "#ef4444", fontSize: 14 }} /> // Smaller icon
                  )}
                </Box>
                
                <Box sx={{ 
                  width: "100%", 
                  bgcolor: "rgba(255,255,255,0.1)", 
                  borderRadius: 0.5, // Smaller border radius
                  overflow: "hidden" 
                }}>
                  <Box
                    sx={{
                      height: 3, // Thinner progress bar
                      width: `${card.progress}%`,
                      background: `linear-gradient(90deg, ${card.color}, ${card.color}80)`,
                      transition: "width 1s ease-in-out",
                      borderRadius: 0.5, // Smaller border radius
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default StatsCards