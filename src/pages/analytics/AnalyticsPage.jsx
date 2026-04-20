// src/pages/analytics/AnalyticsPage.jsx (Dashboard Style)
import { Box, Typography, Grid, Paper } from "@mui/material";
import UserGrowthChart from "../../components/charts/UserGrowthChart";
import GenderDemographicsChart from "../../components/charts/GenderDemographicsChart";
import AgeDistributionChart from "../../components/charts/AgeDistributionChart";
import PlatformEngagementChart from "../../components/charts/PlatformEngagementChart";
import AudioGrowthChart from "../../components/charts/AudioGrowthChart";
import ChatActivityChart from "../../components/charts/ChatActivityChart";
import ChatRolesChart from "../../components/charts/ChatRolesChart";
import UserStatusChart from "../../components/charts/UserStatusChart";
import UserRolesChart from "../../components/charts/UserRolesChart";
import PrivacyAcceptanceChart from "../../components/charts/PrivacyAcceptanceChart";

export default function AnalyticsPage() {
  return (
    <Box sx={{ p: 3, bgcolor: "transparent", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            background: "linear-gradient(135deg, #fff 0%, #646cff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 1,
          }}
        >
          Analytics Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
          Monitor your platform's key metrics and performance indicators
        </Typography>
      </Box>

      {/* Main Layout */}
      <Grid container spacing={3}>
        {/* Left Column - Main Charts */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* Platform Engagement - Full Width */}
            <Grid item xs={12}>
              <PlatformEngagementChart />
            </Grid>

            {/* Chat Activity - Full Width */}
            <Grid item xs={12}>
              <ChatActivityChart />
            </Grid>

            {/* User Growth & Audio Growth - Half each */}
            <Grid item xs={12} md={6}>
              <UserGrowthChart />
            </Grid>
            <Grid item xs={12} md={6}>
              <AudioGrowthChart />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Side Charts */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <ChatRolesChart />
            </Grid>
            <Grid item xs={12} sm={6} lg={12}>
              <GenderDemographicsChart />
            </Grid>
            <Grid item xs={12} sm={6} lg={12}>
              <AgeDistributionChart />
            </Grid>
            <Grid item xs={12} sm={6} lg={12}>
              <UserStatusChart />
            </Grid>
            <Grid item xs={12} sm={6} lg={12}>
              <UserRolesChart />
            </Grid>
            <Grid item xs={12}>
              <PrivacyAcceptanceChart />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}