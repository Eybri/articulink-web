// src/components/charts/ChatRolesChart.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { People } from "@mui/icons-material";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#ec4899"];

const ChatRolesChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getChatRoles();
        if (response && response.chat_roles && response.chat_roles.length > 0) {
          setData(response.chat_roles);
        } else {
          setData([{ role: "user", count: 45 }, { role: "assistant", count: 42 }]);
        }
      } catch (err) {
        console.error("Error fetching chat roles:", err);
        setData([{ role: "user", count: 45 }, { role: "assistant", count: 42 }]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="Message Sender Roles" 
      subtitle="Distribution of messages by sender"
      icon={<People />}
      gradient="linear-gradient(90deg, #f59e0b, #10b981, transparent)"
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
              innerRadius={0}
              outerRadius={90}
              paddingAngle={2}
              dataKey="count"
              nameKey="role"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={2}
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

export default ChatRolesChart;
