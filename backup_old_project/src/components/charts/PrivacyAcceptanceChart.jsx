// src/components/charts/PrivacyAcceptanceChart.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Security } from "@mui/icons-material";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const PrivacyAcceptanceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getPrivacyAcceptance();
        if (response && response.privacy_acceptance && response.privacy_acceptance.length > 0) {
          const formatted = response.privacy_acceptance.map(item => ({
            name: item.accepted ? "Accepted" : "Pending",
            count: item.count,
            fill: item.accepted ? "#10b981" : "#f43f5e"
          }));
          setData(formatted);
        } else {
          setData([
            { name: "Accepted", count: 18, fill: "#10b981" },
            { name: "Pending", count: 4, fill: "#f43f5e" }
          ]);
        }
      } catch (err) {
        console.error("Error fetching privacy acceptance:", err);
        setData([
          { name: "Accepted", count: 18, fill: "#10b981" },
          { name: "Pending", count: 4, fill: "#f43f5e" }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="Privacy Policy" 
      subtitle="Acceptance rate across users"
      icon={<Security />}
      gradient="linear-gradient(90deg, #10b981, #3b82f6, transparent)"
      height={420}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="white">Loading...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="30%" 
            outerRadius="90%" 
            barSize={20} 
            data={data}
          >
            <RadialBar
              minAngle={15}
              background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              clockWise
              dataKey="count"
              cornerRadius={10}
            />
            <Tooltip
              contentStyle={{
                fontFamily: "'Inter', sans-serif",
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
              }}
            />
            <Legend 
              iconSize={10} 
              layout="vertical" 
              verticalAlign="middle" 
              wrapperStyle={{ right: 0, fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.7)" }} 
            />
          </RadialBarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default PrivacyAcceptanceChart;
