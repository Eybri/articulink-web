"use client";

import { useEffect, useState } from "react";
import { ListChecks } from "lucide-react";
import ChartContainer from "./ChartContainer";
import { dashboardAPI } from "@/lib/api";

interface WordStat {
  word: string;
  avg_confidence: number;
  count: number;
}

const WordInsightsChart = () => {
  const [topWords, setTopWords] = useState<WordStat[]>([]);
  const [bottomWords, setBottomWords] = useState<WordStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getWordInsights();
        if (response) {
          setTopWords(response.top || []);
          setBottomWords(response.needs_improvement || []);
        }
      } catch (err) {
        console.error("Error fetching word insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <ChartContainer 
      title="Vocabulary Insights" 
      subtitle="Highest accuracy vs areas for improvement"
      icon={<ListChecks size={20} />}
      gradient="bg-gradient-to-r from-[#1A4480] to-[#2A8FA0]"
      height={300}
    >
      {loading ? (
        <div className="flex h-full items-center justify-center font-bold text-[#4A5A6A] uppercase tracking-widest text-[10px]">
           Analyzing vocabulary...
        </div>
      ) : (
        <div className="flex h-full w-full gap-6 px-1 py-1">
          {/* Top Words */}
          <div className="flex-1 flex flex-col h-full">
            <h4 className="text-[11px] font-bold text-[#1A4480] uppercase tracking-widest mb-3 flex items-center justify-between border-b border-[#DDD6C8]/40 pb-2">
              <span>Mastered Words</span>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Accuracy</span>
            </h4>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {topWords.length > 0 ? topWords.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-[#1C2B3A] capitalize">{item.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#4A5A6A]">{item.count}x</span>
                      <span className="text-[11px] font-bold text-emerald-600">{item.avg_confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[#FAF8F4] border border-[#DDD6C8]/20 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.avg_confidence}%` }} />
                  </div>
                </div>
              )) : (
                <div className="text-[10px] font-medium text-[#4A5A6A] italic flex items-center justify-center h-full">Not enough data...</div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-[1px] h-[90%] my-auto bg-[#DDD6C8]/50" />

          {/* Bottom Words */}
          <div className="flex-1 flex flex-col h-full">
            <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-3 flex items-center justify-between border-b border-[#DDD6C8]/40 pb-2">
              <span>Needs Improvement</span>
              <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Accuracy</span>
            </h4>
            <div className="flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
              {bottomWords.length > 0 ? bottomWords.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[12px] font-bold text-[#1C2B3A] capitalize">{item.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-[#4A5A6A]">{item.count}x</span>
                      <span className="text-[11px] font-bold text-amber-500">{item.avg_confidence.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-[#FAF8F4] border border-[#DDD6C8]/20 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${item.avg_confidence}%` }} />
                  </div>
                </div>
              )) : (
                <div className="text-[10px] font-medium text-[#4A5A6A] italic flex items-center justify-center h-full">Not enough data...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </ChartContainer>
  );
};

export default WordInsightsChart;
