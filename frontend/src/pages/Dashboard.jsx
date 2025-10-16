// src/pages/Dashboard.jsx
import { useState, useEffect } from "react"
import { Box, Typography, Paper, Grid, Card, CardContent, useTheme, useMediaQuery, LinearProgress } from "@mui/material"
import { TrendingUp, Analytics, People, VolumeUp, TrendingDown, Speed, Insights } from "@mui/icons-material"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"

export default function Dashboard({ user }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const trendData = [
    { month: "Jan", accuracy: 65, sessions: 420 },
    { month: "Feb", accuracy: 72, sessions: 680 },
    { month: "Mar", accuracy: 78, sessions: 920 },
    { month: "Apr", accuracy: 85, sessions: 1240 },
    { month: "May", accuracy: 88, sessions: 1580 },
    { month: "Jun", accuracy: 92, sessions: 1850 },
  ]

  const pieData = [
    { name: "Consonants", value: 45, color: "#646cff" },
    { name: "Vowels", value: 30, color: "#10b981" },
    { name: "Diphthongs", value: 25, color: "#f59e0b" },
  ]

  useEffect(() => {
    // Simulate loading delay for better UX
    setTimeout(() => {
      setData([
        { phoneme: "s→θ", count: 40 },
        { phoneme: "th→s", count: 15 },
        { phoneme: "nasal vowels", count: 23 },
        { phoneme: "n→m", count: 8 },
        { phoneme: "r→l", count: 12 },
        { phoneme: "v→w", count: 18 },
      ])
      setLoading(false)
    }, 1500)
  }, [])

  const statsData = [
    { 
      title: "Total Sessions", 
      value: "2,847", 
      change: "+12%", 
      trend: "up",
      color: "#646cff", 
      icon: <TrendingUp />,
      progress: 78
    },
    { 
      title: "Accuracy Rate", 
      value: "92%", 
      change: "+5%", 
      trend: "up",
      color: "#10b981", 
      icon: <Analytics />,
      progress: 92
    },
    { 
      title: "Active Users", 
      value: "1,234", 
      change: "+8%", 
      trend: "up",
      color: "#f59e0b", 
      icon: <People />,
      progress: 65
    },
    { 
      title: "Phonemes Practiced", 
      value: "15,678", 
      change: "+15%", 
      trend: "up",
      color: "#535bf2", 
      icon: <VolumeUp />,
      progress: 84
    },
  ]

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
          Here's what's happening with your speech therapy platform today.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsData.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <Card
              sx={{
                height: 180,
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: 4,
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-8px) scale(1.02)",
                  boxShadow: `0 20px 60px rgba(0,0,0,0.3), 0 0 40px ${stat.color}20`,
                  border: `1px solid ${stat.color}40`,
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: `linear-gradient(90deg, ${stat.color}, transparent)`,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "2px",
                  height: "100%",
                  background: `linear-gradient(180deg, ${stat.color}40, transparent)`,
                },
              }}
            >
              <CardContent sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                {loading && (
                  <LinearProgress 
                    sx={{ 
                      position: "absolute", 
                      top: 0, 
                      left: 0, 
                      right: 0,
                      bgcolor: "rgba(255,255,255,0.1)",
                      "& .MuiLinearProgress-bar": { bgcolor: stat.color }
                    }} 
                  />
                )}
                
                <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1.5,
                        fontWeight: 500,
                        fontSize: "0.85rem",
                        fontFamily: "'Inter', sans-serif",
                        color: "rgba(255, 255, 255, 0.7)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {stat.title}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mb: 1,
                        color: "white",
                        fontFamily: "'Poppins', sans-serif",
                        lineHeight: 1,
                        textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      {loading ? "..." : stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                      color: stat.color,
                      flexShrink: 0,
                      ml: 2,
                      boxShadow: `0 4px 20px ${stat.color}30`,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                
                <Box sx={{ mt: "auto" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: stat.trend === "up" ? "#10b981" : "#ef4444",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {stat.change} from last month
                    </Typography>
                    {stat.trend === "up" ? (
                      <TrendingUp sx={{ color: "#10b981", fontSize: 16 }} />
                    ) : (
                      <TrendingDown sx={{ color: "#ef4444", fontSize: 16 }} />
                    )}
                  </Box>
                  
                  <Box sx={{ width: "100%", bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1, overflow: "hidden" }}>
                    <Box
                      sx={{
                        height: 4,
                        width: `${stat.progress}%`,
                        background: `linear-gradient(90deg, ${stat.color}, ${stat.color}80)`,
                        transition: "width 1s ease-in-out",
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Bar Chart */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 4,
              height: 450,
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
                background: "linear-gradient(90deg, #646cff, #10b981, transparent)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #646cff20, #646cff10)",
                  color: "#646cff",
                }}
              >
                <Insights />
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
                  Top Mispronounced Phonemes
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Most common pronunciation errors this month
                </Typography>
              </Box>
            </Box>
            
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                <XAxis 
                  dataKey="phoneme" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: 12,
                    fill: "rgba(255, 255, 255, 0.7)"
                  }} 
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: 12,
                    fill: "rgba(255, 255, 255, 0.7)"
                  }} 
                />
                <RechartsTooltip
                  contentStyle={{
                    fontFamily: "'Inter', sans-serif",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(20px)",
                    color: "white",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#646cff" />
                    <stop offset="100%" stopColor="#535bf2" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper
            sx={{
              p: 4,
              height: 450,
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #10b981, #f59e0b, transparent)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #10b98120, #10b98110)",
                  color: "#10b981",
                }}
              >
                <Speed />
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
                  Error Distribution
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Error breakdown by type
                </Typography>
              </Box>
            </Box>
            
            <ResponsiveContainer width="100%" height="50%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={50} 
                  outerRadius={90} 
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    fontFamily: "'Inter', sans-serif",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(20px)",
                    color: "white",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <Box sx={{ mt: 3 }}>
              {pieData.map((item, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: item.color,
                        borderRadius: "50%",
                        boxShadow: `0 2px 8px ${item.color}40`,
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "'Inter', sans-serif",
                        color: "rgba(255, 255, 255, 0.8)",
                        fontWeight: 500,
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: "'Inter', sans-serif",
                      color: item.color,
                      fontWeight: 700,
                    }}
                  >
                    {item.value}%
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Area Chart */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 4,
              height: 350,
              background: "rgba(255, 255, 255, 0.03)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 4,
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #535bf2, #646cff, transparent)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  background: "linear-gradient(135deg, #535bf220, #535bf210)",
                  color: "#535bf2",
                }}
              >
                <Analytics />
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
                  Performance Trends
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "rgba(255, 255, 255, 0.6)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Accuracy improvement and session growth over time
                </Typography>
              </Box>
            </Box>
            
            <ResponsiveContainer width="100%" height="75%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#646cff" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#646cff" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: 12,
                    fill: "rgba(255, 255, 255, 0.7)"
                  }} 
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ 
                    fontFamily: "'Inter', sans-serif", 
                    fontSize: 12,
                    fill: "rgba(255, 255, 255, 0.7)"
                  }} 
                />
                <RechartsTooltip
                  contentStyle={{
                    fontFamily: "'Inter', sans-serif",
                    borderRadius: 12,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    background: "rgba(0, 0, 0, 0.8)",
                    backdropFilter: "blur(20px)",
                    color: "white",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#646cff"
                  strokeWidth={3}
                  fill="url(#accuracyGradient)"
                  dot={{ fill: "#646cff", strokeWidth: 0, r: 6 }}
                  activeDot={{ r: 8, stroke: "#646cff", strokeWidth: 2, fill: "white" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  )
}