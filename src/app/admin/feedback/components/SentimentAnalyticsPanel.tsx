"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Sparkles, Lightbulb } from "lucide-react";
import { FeedbackStats } from "../types";

const COLORS = {
  positive: '#10B981', // emerald-500
  neutral: '#F59E0B',  // amber-500
  negative: '#EF4444', // red-500
};

export function SentimentAnalyticsPanel({ stats }: { stats: FeedbackStats | null }) {
  if (!stats || !stats.sentimentDistribution || stats.sentimentDistribution.length === 0) {
    return null; // Don't show if no AI data is available
  }

  const chartData = stats.sentimentDistribution.filter(d => d && d.count > 0 && d.sentiment).map(d => {
    const sent = d.sentiment || 'neutral';
    return {
      name: sent.charAt(0).toUpperCase() + sent.slice(1),
      value: d.count,
      color: COLORS[sent as keyof typeof COLORS] || '#1A4480'
    };
  });

  const totalAnalyzed = stats.sentimentDistribution.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sentiment Chart */}
      <div className="bg-white border border-[#DDD6C8] rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-[#4A5A6A] uppercase tracking-widest flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-[#1A4480]" />
          Sentiment Analysis
        </h3>
        {totalAnalyzed === 0 ? (
          <div className="h-40 flex items-center justify-center text-xs text-[#4A5A6A]">
            No data yet
          </div>
        ) : (
          <div className="flex items-center">
            <div className="h-40 w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #DDD6C8', fontSize: '12px' }}
                    itemStyle={{ color: '#1C2B3A', fontWeight: 600 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 pl-4 space-y-3">
              {stats.sentimentDistribution.filter(s => s && s.sentiment).map((s) => (
                <div key={s.sentiment} className="flex flex-col">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#4A5A6A] uppercase tracking-wider mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[s.sentiment as keyof typeof COLORS] || '#ccc' }} />
                      {s.sentiment}
                    </div>
                    <span>{s.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#FAF8F4] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000" 
                      style={{ 
                        width: `${s.percentage}%`, 
                        backgroundColor: COLORS[s.sentiment as keyof typeof COLORS] || '#ccc' 
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Categories */}
      {stats.topCategories && stats.topCategories.length > 0 && (
        <div className="bg-white border border-[#DDD6C8] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <h3 className="text-xs font-bold text-[#4A5A6A] uppercase tracking-widest flex items-center gap-2 mb-4">
            <Lightbulb size={14} className="text-[#F59E0B]" />
            Trending Topics
          </h3>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {stats.topCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5 group cursor-default">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-[#1C2B3A]">{cat.category}</span>
                  <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">
                    {cat.count} mentions
                  </span>
                </div>
                <div className="h-2 w-full bg-[#FAF8F4] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#1A4480] rounded-full opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out"
                    style={{ width: `${Math.max(cat.percentage, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
