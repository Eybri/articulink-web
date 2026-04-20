// src/components/charts/AudioGrowthChart.jsx
import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Mic } from "@mui/icons-material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardApi } from "../../api/dashboardApi";

const AudioGrowthChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardApi.getAudioGrowth('daily');
        if (response && response.audio_growth && response.audio_growth.length > 0) {
          setData(response.audio_growth);
        } else {
          setData([
            { period: "Mon", count: 4 },
            { period: "Tue", count: 7 },
            { period: "Wed", count: 3 },
            { period: "Thu", count: 12 },
            { period: "Fri", count: 18 }
          ]);
        }
      } catch (err) {
        console.error("Error fetching audio growth:", err);
        setData([
          { period: "Mon", count: 4 },
          { period: "Tue", count: 7 },
          { period: "Wed", count: 3 },
          { period: "Thu", count: 12 },
          { period: "Fri", count: 18 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="Pronunciation Attempts" 
      subtitle="Audio clips uploaded over time"
      icon={<Mic />}
      gradient="linear-gradient(90deg, #f43f5e, #fb923c, transparent)"
      height={420}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Typography color="white">Loading...</Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              formatter={(value) => [value, "Audio Clips"]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#f43f5e"
              strokeWidth={3}
              dot={{ fill: "#f43f5e", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, stroke: "#f43f5e", strokeWidth: 2, fill: "white" }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default AudioGrowthChart;
