"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import ChartContainer from "./ChartContainer";
import { dashboardAPI } from "@/lib/api";

const ChatActivityChart = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getChatActivity('daily');
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
      title="Chat Activity" 
      subtitle="Total message volume"
      icon={<MessageSquare size={18} />}
      gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
      height={420}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center font-bold text-white/20 uppercase tracking-widest text-[10px]">
           Calculating interactions...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorChat" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            />
            <Area 
              type="monotone" 
              dataKey="count" 
              name="Messages"
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
