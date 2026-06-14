"use client";

import { useEffect, useState } from "react";
import { Mic2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardAPI } from "@/lib/api";

const COLORS = {
  Tagalog: "#1A4480", // Royal Blue
  English: "#2A8FA0"  // Teal
};

const LanguageClarityChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getLanguageClarity();
        if (response && response.length > 0) {
          setData(response);
        } else {
          setData([
            { language: "Tagalog", clarity_score: 0, count: 0 },
            { language: "English", clarity_score: 0, count: 0 }
          ]);
        }
      } catch (err) {
        console.error("Error fetching language clarity:", err);
        setData([
          { language: "Tagalog", clarity_score: 0, count: 0 },
          { language: "English", clarity_score: 0, count: 0 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border border-[#DDD6C8] shadow-lg">
          <p className="text-[12px] font-bold text-[#1C2B3A] mb-1">{label}</p>
          <p className="text-[11px] font-semibold text-[#1A4480]">
            Avg Clarity: {data.clarity_score.toFixed(1)}%
          </p>
          <p className="text-[10px] font-medium text-[#4A5A6A] mt-1">
            Total Recordings: {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer 
      title="Language Clarity Insights" 
      subtitle="Average confidence scores across overall users"
      icon={<Mic2 size={20} />}
      gradient="bg-gradient-to-r from-[#1A4480] to-[#2A8FA0]"
      height={300}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center font-bold text-[#4A5A6A] uppercase tracking-widest text-[10px]">
           Analyzing audio metrics...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barSize={60}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDD6C8" vertical={false} />
            <XAxis 
              dataKey="language" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4A5A6A", fontSize: 11, fontWeight: 700 }} 
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#4A5A6A", fontSize: 10, fontWeight: 700 }}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
            <Bar dataKey="clarity_score" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.language as keyof typeof COLORS] || "#1C2B3A"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default LanguageClarityChart;
