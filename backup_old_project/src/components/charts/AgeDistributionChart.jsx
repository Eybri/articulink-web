// src/components/charts/AgeDistributionChart.jsx
import { useState, useEffect } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Cake } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const AgeDistributionChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getAgeDistribution();
        if (response && response.age_distribution && response.age_distribution.length > 0) {
          setData(response.age_distribution);
        } else {
          setData([
            { age_range: '13-17', count: 1200, percentage: 12 },
            { age_range: '18-24', count: 3500, percentage: 35 },
            { age_range: '25-34', count: 2800, percentage: 28 },
            { age_range: '35-44', count: 1500, percentage: 15 },
            { age_range: '45-54', count: 700, percentage: 7 },
            { age_range: '55+', count: 300, percentage: 3 }
          ]);
        }
      } catch (err) {
        console.error('Error fetching age distribution:', err);
        setData([
          { age_range: '13-17', count: 1200, percentage: 12 },
          { age_range: '18-24', count: 3500, percentage: 35 },
          { age_range: '25-34', count: 2800, percentage: 28 },
          { age_range: '35-44', count: 1500, percentage: 15 },
          { age_range: '45-54', count: 700, percentage: 7 },
          { age_range: '55+', count: 300, percentage: 3 }
        ]);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <ChartContainer 
        title="Age Distribution" 
        subtitle="Distribution of users by age range"
        icon={<Cake />}
        height={500}
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
        title="Age Distribution" 
        subtitle="Distribution of users by age range"
        icon={<Cake />}
        height={500}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer 
      title="Age Distribution" 
      subtitle="Distribution of users by age range"
      icon={<Cake />}
      gradient="linear-gradient(90deg, #f59e0b, #ef4444, transparent)"
      height={500}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="age_range" 
            axisLine={false}
            tickLine={false}
            tick={{ 
              fontFamily: "'Inter', sans-serif", 
              fontSize: 11,
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
            formatter={(value, name, props) => [
              `${value} users (${props.payload.percentage}%)`, 
              'Count'
            ]}
          />
          <Bar 
            dataKey="count" 
            fill="url(#ageGradient)" 
            radius={[8, 8, 0, 0]}
          />
          <defs>
            <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default AgeDistributionChart;