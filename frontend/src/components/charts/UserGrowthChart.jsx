// src/components/charts/UserGrowthChart.jsx
import { useState, useEffect } from "react";
import { Box, Typography, LinearProgress, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const UserGrowthChart = () => {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getUserGrowth(timeframe);
        setData(response.growth_data);
      } catch (err) {
        setError('Failed to fetch user growth data');
        console.error('Error fetching user growth:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  const handleTimeframeChange = (event) => {
    setTimeframe(event.target.value);
  };

  if (loading) {
    return (
      <ChartContainer 
        title="User Growth Over Time" 
        subtitle="Number of new users over time"
        icon={<TrendingUp />}
        height={400}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
          <LinearProgress sx={{ width: '60%', bgcolor: 'rgba(255,255,255,0.1)' }} />
        </Box>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer 
        title="User Growth Over Time" 
        subtitle="Number of new users over time"
        icon={<TrendingUp />}
        height={400}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer 
      title="User Growth Over Time" 
      subtitle="Number of new users over time"
      icon={<TrendingUp />}
      gradient="linear-gradient(90deg, #10b981, #f59e0b, transparent)"
      height={450}
    >
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Timeframe</InputLabel>
          <Select
            value={timeframe}
            label="Timeframe"
            onChange={handleTimeframeChange}
            sx={{
              color: 'white',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255,255,255,0.4)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#646cff',
              },
            }}
          >
            <MenuItem value="daily">Daily</MenuItem>
            <MenuItem value="weekly">Weekly</MenuItem>
            <MenuItem value="monthly">Monthly</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#646cff" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#646cff" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="period" 
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
          <Tooltip
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
            dataKey="count"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#growthGradient)"
            dot={{ fill: "#10b981", strokeWidth: 0, r: 4 }}
            activeDot={{ r: 6, stroke: "#10b981", strokeWidth: 2, fill: "white" }}
            name="New Users"
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke="#646cff"
            strokeWidth={2}
            fill="url(#cumulativeGradient)"
            strokeDasharray="5 5"
            name="Total Users"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default UserGrowthChart;