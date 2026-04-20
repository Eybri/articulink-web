// src/components/charts/PlatformEngagementChart.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Timeline } from "@mui/icons-material";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const PlatformEngagementChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getPlatformEngagement('daily');
        if (response && response.engagement && response.engagement.length > 0) {
          setData(response.engagement);
        } else {
          setData([
            { period: "Mon", chat_count: 12, audio_count: 4 },
            { period: "Tue", chat_count: 19, audio_count: 7 },
            { period: "Wed", chat_count: 15, audio_count: 3 },
            { period: "Thu", chat_count: 22, audio_count: 12 },
            { period: "Fri", chat_count: 30, audio_count: 18 }
          ]);
        }
      } catch (err) {
        console.error("Error fetching platform engagement:", err);
        setData([
          { period: "Mon", chat_count: 12, audio_count: 4 },
          { period: "Tue", chat_count: 19, audio_count: 7 },
          { period: "Wed", chat_count: 15, audio_count: 3 },
          { period: "Thu", chat_count: 22, audio_count: 12 },
          { period: "Fri", chat_count: 30, audio_count: 18 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="Platform Engagement" 
      subtitle="Comparing Chat vs Audio feature usage"
      icon={<Timeline />}
      gradient="linear-gradient(90deg, #8b5cf6, #06b6d4, transparent)"
      height={420}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="white">Loading...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            />
            <Legend 
              wrapperStyle={{ fontFamily: "'Inter', sans-serif", color: "rgba(255,255,255,0.7)" }} 
            />
            <Bar dataKey="chat_count" name="Chat Messages" barSize={20} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="audio_count" name="Audio Clips" stroke="#06b6d4" strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default PlatformEngagementChart;
