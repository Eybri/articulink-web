// src/components/charts/ChatActivityChart.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Chat } from "@mui/icons-material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const ChatActivityChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getChatActivity('daily');
        if (response && response.chat_activity && response.chat_activity.length > 0) {
          setData(response.chat_activity);
        } else {
          setData([
            { period: "Mon", count: 12 },
            { period: "Tue", count: 19 },
            { period: "Wed", count: 15 },
            { period: "Thu", count: 22 },
            { period: "Fri", count: 30 }
          ]);
        }
      } catch (err) {
        console.error("Error fetching chat activity:", err);
        setData([
          { period: "Mon", count: 12 },
          { period: "Tue", count: 19 },
          { period: "Wed", count: 15 },
          { period: "Thu", count: 22 },
          { period: "Fri", count: 30 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="Chat Activity Over Time" 
      subtitle="Volume of chat messages daily"
      icon={<Chat />}
      gradient="linear-gradient(90deg, #3b82f6, #8b5cf6, transparent)"
      height={420}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="white">Loading...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorChat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }} 
            />
            <YAxis 
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
              formatter={(value) => [value, "Messages"]}
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorChat)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default ChatActivityChart;
