// src/components/charts/UserStatusChart.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#6366f1"];

const UserStatusChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getUserStatus();
        if (response && response.status_distribution && response.status_distribution.length > 0) {
          setData(response.status_distribution);
        } else {
          setData([{ status: "active", count: 10 }, { status: "inactive", count: 2 }]);
        }
      } catch (err) {
        console.error("Error fetching user status:", err);
        setData([{ status: "active", count: 10 }, { status: "inactive", count: 2 }]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="User Status Distribution" 
      subtitle="Active vs Inactive accounts"
      icon={<AccountCircle />}
      gradient="linear-gradient(90deg, #10b981, #ef4444, transparent)"
      height={420}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="white">Loading...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="count"
              nameKey="status"
              stroke="none"
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
                color: "white",
              }}
              formatter={(value, name) => [value, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle"
              formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'Inter', sans-serif" }}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default UserStatusChart;
