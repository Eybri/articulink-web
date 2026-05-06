// src/pages/Dashboard.jsx
import { useState, useEffect } from "react"
import { Box, Typography, Grid } from "@mui/material"
import StatsCards from "../../components/StatsCards"
import GenderDemographicsChart from "../../components/charts/GenderDemographicsChart"
import UserGrowthChart from "../../components/charts/UserGrowthChart"
import AgeDistributionChart from "../../components/charts/AgeDistributionChart"
import DashboardUserList from "../../components/DashboardUserList"
import PlatformEngagementChart from "../../components/charts/PlatformEngagementChart"
import ChatActivityChart from "../../components/charts/ChatActivityChart"
import SystemHealth from "../../components/SystemHealth"
import { userAPI } from "../../api/api" // Use the same API as UserList

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // Use the same API endpoint as UserList
        const statsData = await userAPI.getUserStats()
        setStats(statsData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to empty stats if API fails
        setStats({})
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <>
      {/* Minimalist Professional Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            fontSize: "1rem", // Minimalist cap
            color: "#ffffff",
            mb: 0.5,
            letterSpacing: "-0.01em",
            opacity: 0.9
          }}
        >
          Welcome, {user?.first_name || user?.email?.split('@')[0] || 'Admin'}! 👋
        </Typography>
        <Typography
          sx={{
            color: "rgba(255, 255, 255, 0.4)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "0.65rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}
        >
          System overview & analytics
        </Typography>
      </Box>

      {/* KPI Section */}
      <Box sx={{ mb: 4 }}>
        <StatsCards stats={stats} loading={loading} />
      </Box>

      {/* Engagement & Health Analytics */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 12, lg: 8 }}>
          <PlatformEngagementChart />
        </Grid>
        <Grid item size={{ xs: 12, lg: 4 }}>
          <SystemHealth />
        </Grid>
      </Grid>

      {/* Growth & Activity (Strategic Analytics) */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 12, lg: 8 }}>
          <UserGrowthChart />
        </Grid>
        <Grid item size={{ xs: 12, lg: 4 }}>
          <ChatActivityChart />
        </Grid>
      </Grid>

      {/* Secondary Dynamic Row (Balanced Triple-Column View) */}
      <Grid container spacing={4}>
        <Grid item size={{ xs: 12, lg: 4 }}>
          <GenderDemographicsChart />
        </Grid>
        <Grid item size={{ xs: 12, lg: 4 }}>
          <AgeDistributionChart />
        </Grid>
        <Grid item size={{ xs: 12, lg: 4 }}>
          <DashboardUserList />
        </Grid>
      </Grid>
    </>
  )
}