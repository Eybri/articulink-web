"use client";

import { useEffect, useState } from "react";
import { Timeline } from "@mui/icons-material"; // Keep using MUI icons for consistency with old design if needed, or use Lucide
import { Activity } from "lucide-react";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardAPI } from "@/lib/api";

const PlatformEngagementChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getPlatformEngagement('daily');
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
      subtitle="Chat vs Audio usage comparison"
      icon={<Activity size={20} />}
      gradient="bg-gradient-to-r from-violet-500 to-cyan-500"
      height={420}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center font-bold text-white/20 uppercase tracking-widest">
           Analyzing metrics...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10, fontWeight: 700 }} 
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(255, 255, 255, 0.4)", fontSize: 10, fontWeight: 700 }} 
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(9, 9, 11, 0.9)",
                backdropFilter: "blur(10px)",
                color: "white",
                fontSize: 12,
                fontWeight: 600
              }}
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            />
            <Legend 
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ 
                paddingBottom: 20,
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: "rgba(255,255,255,0.5)" 
              }} 
            />
            <Bar dataKey="chat_count" name="Chat Activities" barSize={15} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="audio_count" name="Audio Sessions" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4, fill: '#06b6d4', strokeWidth: 2, stroke: '#09090b' }} activeDot={{ r: 6, strokeWidth: 0 }} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default PlatformEngagementChart;
