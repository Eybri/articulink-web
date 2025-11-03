// src/components/charts/GenderDemographicsChart.jsx
import { useState, useEffect } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { People } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const GenderDemographicsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#646cff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getGenderDemographics();
        setData(response.gender_distribution);
      } catch (err) {
        setError('Failed to fetch gender demographics');
        console.error('Error fetching gender demographics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <ChartContainer 
        title="Gender Demographics" 
        subtitle="Distribution of users by gender"
        icon={<People />}
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
        title="Gender Demographics" 
        subtitle="Distribution of users by gender"
        icon={<People />}
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
      title="Gender Demographics" 
      subtitle="Distribution of users by gender"
      icon={<People />}
      gradient="linear-gradient(90deg, #646cff, #10b981, transparent)"
    >
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="count"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
            <Tooltip
            contentStyle={{
                fontFamily: "'Inter', sans-serif",
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(0, 0, 0, 0.8)",
                backdropFilter: "blur(20px)",
            }}
            itemStyle={{ color: "white" }}
            formatter={(value, name, props) => [
                `${value} users (${props.payload.percentage}%)`, 
                props.payload.gender
            ]}
            />
          <Legend 
            wrapperStyle={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.8)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      
      <Box sx={{ mt: 2 }}>
        {data.map((item, index) => (
          <Box key={item.gender} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  bgcolor: COLORS[index % COLORS.length],
                  borderRadius: "50%",
                  boxShadow: `0 2px 8px ${COLORS[index % COLORS.length]}40`,
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
                {item.gender}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              sx={{ 
                fontFamily: "'Inter', sans-serif",
                color: COLORS[index % COLORS.length],
                fontWeight: 700,
              }}
            >
              {item.count} ({item.percentage}%)
            </Typography>
          </Box>
        ))}
      </Box>
    </ChartContainer>
  );
};

export default GenderDemographicsChart;