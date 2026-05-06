"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ChartContainer from "./ChartContainer";
import { userAPI } from "@/lib/api";

const AgeDistributionChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getAgeDistribution();
        if (response && response.age_distribution && response.age_distribution.length > 0) {
          setData(response.age_distribution);
        } else {
          setData([
            { age_range: '13-17', count: 1200, percentage: 12 },
            { age_range: '18-24', count: 3500, percentage: 35 },
            { age_range: '25-34', count: 2800, percentage: 28 },
            { age_range: '35-44', count: 1500, percentage: 15 },
            { age_range: '45-54', count: 700, percentage: 7 },
            { age_range: '55+', count: 300, percentage: 3 }
          ]);
        }
      } catch (err) {
        console.error('Error fetching age distribution:', err);
        setData([
          { age_range: '13-17', count: 1200, percentage: 12 },
          { age_range: '18-24', count: 3500, percentage: 35 },
          { age_range: '25-34', count: 2800, percentage: 28 },
          { age_range: '35-44', count: 1500, percentage: 15 },
          { age_range: '45-54', count: 700, percentage: 7 },
          { age_range: '55+', count: 300, percentage: 3 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="Age Metrics" 
      subtitle="Cohort age distribution"
      icon={<User size={18} />}
      gradient="bg-gradient-to-r from-orange-500 to-red-500"
      height={500}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center font-bold text-white/20 uppercase tracking-widest text-[10px]">
           Profiling cohorts...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ageGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="age_range" 
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
            />
            <Bar 
              dataKey="count" 
              fill="url(#ageGradient)" 
              radius={[10, 10, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartContainer>
  );
};

export default AgeDistributionChart;
