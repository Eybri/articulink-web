// src/components/charts/UserRolesChart.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Badge } from "@mui/icons-material";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const UserRolesChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getUserRoles();
        if (response && response.roles_distribution && response.roles_distribution.length > 0) {
          setData(response.roles_distribution);
        } else {
          setData([{ role: "user", count: 15 }, { role: "admin", count: 1 }]);
        }
      } catch (err) {
        console.error("Error fetching user roles:", err);
        setData([{ role: "user", count: 15 }, { role: "admin", count: 1 }]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="User Roles" 
      subtitle="Distribution by access level"
      icon={<Badge />}
      gradient="linear-gradient(90deg, #ec4899, #8b5cf6, transparent)"
      height={420}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="white">Loading...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }} 
            />
            <YAxis 
              dataKey="role" 
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }} 
            />
            <Tooltip
              contentStyle={{
                fontFamily: "'Inter', sans-serif",
                borderRadius: 12,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(0, 0, 0, 0.8)",
                color: "white",
              }}
              formatter={(value) => [value, "Count"]}
            />
            <Bar 
              dataKey="count" 
              fill="#ec4899" 
              radius={[0, 4, 4, 0]}
              barSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default UserRolesChart;
