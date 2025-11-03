// src/pages/Dashboard.jsx
import { useState, useEffect } from "react"
import { Box, Typography, Grid } from "@mui/material"
import StatsCards from "../components/StatsCards"
import GenderDemographicsChart from "../components/charts/GenderDemographicsChart"
import UserGrowthChart from "../components/charts/UserGrowthChart"
import AgeDistributionChart from "../components/charts/AgeDistributionChart"
import { userAPI } from "../api/api" // Use the same API as UserList

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
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 800,
            background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
            letterSpacing: "-0.02em",
          }}
        >
          Welcome back, {user?.email?.split('@')[0] || 'Admin'}! 👋
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            fontFamily: "'Inter', sans-serif",
            fontSize: "1.1rem",
          }}
        >
          Here's what's happening with your user management system today.
        </Typography>
      </Box>

      {/* Stats Cards Component */}
      <StatsCards stats={stats} loading={loading} />

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* User Growth Chart */}
        <Grid item xs={12} lg={8}>
          <UserGrowthChart />
        </Grid>

        {/* Gender Demographics Chart */}
        <Grid item xs={12} lg={4}>
          <GenderDemographicsChart />
        </Grid>

        {/* Age Distribution Chart */}
        <Grid item xs={12}>
          <AgeDistributionChart />
        </Grid>
      </Grid>
    </>
  )
}