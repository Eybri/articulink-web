"use client";

import { useEffect, useState } from "react";
import { Mic2 } from "lucide-react";
import { RadialBarChart, RadialBar, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
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
          <p className="text-[12px] font-bold text-[#1C2B3A] mb-1">{label || data.language}</p>
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

  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-col gap-5 ml-4">
        {payload.map((entry: any, index: number) => {
          // payload value maps to the name/dataKey, so we find the corresponding data item
          const itemData = data.find(d => d.language === entry.value) || data[index];
          return (
            <li key={`item-${index}`} className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#1C2B3A] uppercase tracking-wider">{itemData?.language}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold" style={{ color: entry.color || entry.payload?.fill }}>
                    {itemData?.clarity_score?.toFixed(1)}%
                  </span>
                  <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest bg-[#FAF8F4] px-2 py-1 rounded-md border border-[#DDD6C8]/40">
                    {itemData?.count} Clips
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
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
          <RadialBarChart 
            cx="50%" 
            cy="50%" 
            innerRadius="50%" 
            outerRadius="100%" 
            barSize={24} 
            data={data} 
            startAngle={90} 
            endAngle={-270}
          >
            <RadialBar
              minAngle={15}
              background={{ fill: '#FAF8F4' }}
              clockWise
              dataKey="clarity_score"
              cornerRadius={10}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.language as keyof typeof COLORS] || "#1C2B3A"} />
              ))}
            </RadialBar>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
            <Legend 
              content={<CustomLegend />}
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
            />
            {/* Center label showing highest language */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-[#1C2B3A]">
              {(data.reduce((max, obj) => (max.clarity_score > obj.clarity_score) ? max : obj, data[0] || { clarity_score: 0 })).clarity_score.toFixed(1)}%
            </text>
            <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold fill-[#4A5A6A] uppercase tracking-widest">
              Top Clarity
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default LanguageClarityChart;
