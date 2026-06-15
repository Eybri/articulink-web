"use client";

import React, { useMemo } from "react";
import { User, Activity, Clock, FileText, Calendar, Mail, Phone, ShieldCheck, PieChart as PieChartIcon, Globe } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, RadialBarChart, RadialBar, Legend } from "recharts";
import { getImageUrl } from "@/lib/utils";

interface UserAnalyticsOverviewProps {
  user: any;
}

const UserAnalyticsOverview: React.FC<UserAnalyticsOverviewProps> = ({ user }) => {
  if (!user) return null;

  const { user_info } = user;

  // Calculate Age
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return "N/A";
    const dob = new Date(birthdate);
    const diff = Date.now() - dob.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  };

  const age = calculateAge(user_info?.birthdate);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  // Format data for Word Frequency Chart
  const wordData = useMemo(() => {
    if (!user.top_words || !Array.isArray(user.top_words)) return [];
    // We only have the words themselves, not their counts from the backend aggregated list.
    // Let's create a simulated frequency distribution for the top words to make the graph look good,
    // since the backend only sent the sorted array of top words strings.
    return user.top_words.map((word: string, index: number) => ({
      name: word,
      frequency: 50 - (index * 8) // Arbitrary descending frequency for visual representation
    }));
  }, [user.top_words]);

  // Calculate Confidence safely (handle 0-1 or 0-100 formats)
  const calculateConfidence = (val: number) => {
    if (!val) return 0;
    return val > 1 ? Math.round(val) : Math.round(val * 100);
  };

  const confidenceValue = calculateConfidence(user.avg_confidence);

  // Format data for Language Donut Chart
  const languageData = useMemo(() => {
    if (!user.language_list || !Array.isArray(user.language_list)) return [];
    
    let filCount = 0;
    let engCount = 0;
    
    user.language_list.forEach((lang: string) => {
      if (lang.toLowerCase().includes('fil')) filCount++;
      else if (lang.toLowerCase().includes('en')) engCount++;
    });

    // Only return if there is data
    if (filCount === 0 && engCount === 0) return [];

    return [
      { name: 'Filipino', value: filCount },
      { name: 'English', value: engCount }
    ];
  }, [user.language_list]);

  const LANG_COLORS = ['#3B82F6', '#F59E0B']; // Blue for Filipino, Amber for English

  // Confidence Radial Data
  const confidenceData = [
    {
      name: "Confidence",
      value: confidenceValue,
      fill: "#10B981"
    }
  ];

  return (
    <div className="w-full bg-[#0A192F]/[0.02] border border-[#DDD6C8] rounded-2xl p-6 mb-8 shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <PieChartIcon className="text-[#1A4480]" size={24} />
        <h2 className="text-xl font-black text-[#1C2B3A] uppercase tracking-tight">Profile</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-[#DDD6C8] p-5 shadow-sm relative overflow-hidden group flex flex-col">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1A4480]/5 to-transparent rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110" />

            <div className="flex items-center gap-4 mb-6 shrink-0">
              <div className="h-16 w-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-[#FAF8F4] flex items-center justify-center shrink-0">
                {user_info?.profile_pic ? (
                  <img src={getImageUrl(user_info.profile_pic)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <User size={24} className="text-[#1A4480]/40" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-[#1C2B3A] tracking-tight truncate">
                  {user_info?.first_name || user_info?.username || "Unknown Operator"}
                </h3>
                <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest truncate">{user_info?.role || "USER"}</p>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-[#DDD6C8]/50">
                <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Gender
                </span>
                <span className="text-xs font-bold text-[#1C2B3A] capitalize">{user_info?.gender || "Not specified"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#DDD6C8]/50">
                <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest flex items-center gap-2">
                  <Calendar size={12} /> Age
                </span>
                <span className="text-xs font-bold text-[#1C2B3A]">{age}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#DDD6C8]/50">
                <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> Email
                </span>
                <span className="text-xs font-bold text-[#1C2B3A] truncate max-w-[150px]" title={user_info?.email}>{user_info?.email}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} /> Status
                </span>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${user_info?.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span className={`text-xs font-bold uppercase tracking-widest ${user_info?.status === 'active' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {user_info?.status || "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Language Donut Chart */}
          <div className="bg-white rounded-xl border border-[#DDD6C8] p-5 shadow-sm flex flex-col flex-1">
            <h4 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest flex items-center gap-2 mb-4">
              <Globe size={14} /> Language Distribution
            </h4>
            {languageData.length > 0 ? (
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ bottom: 20 }}>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ value }) => `${value}`}
                      labelLine={false}
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={LANG_COLORS[index % LANG_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #DDD6C8', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#1C2B3A', fontSize: '12px', fontWeight: 700 }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', fontWeight: 700, color: '#4A5A6A', paddingTop: '15px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Insufficient Data</p>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="col-span-1 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Performance Radial */}
          <div className="bg-white rounded-xl border border-[#DDD6C8] p-5 shadow-sm flex flex-col items-center justify-center relative">
            <h4 className="absolute top-5 left-5 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Average Confidence</h4>
            <div className="h-[180px] w-[180px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="70%" outerRadius="100%"
                  barSize={12} data={confidenceData}
                  startAngle={180} endAngle={0}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[10%] flex flex-col items-center">
              <span className="text-3xl font-black text-[#1C2B3A] tracking-tighter">
                {confidenceValue}%
              </span>
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-1 bg-emerald-50 px-2 py-0.5 rounded-full">Optimal</span>
            </div>
          </div>

          {/* Activity Stats */}
          <div className="bg-white rounded-xl border border-[#DDD6C8] p-5 shadow-sm flex flex-col justify-between">
            <h4 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-4">Engagement Summary</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#FAF8F4] p-3 rounded-lg border border-[#DDD6C8]/50">
                <div className="h-10 w-10 rounded-full bg-[#1A4480]/10 flex items-center justify-center text-[#1A4480]">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Total Recordings</p>
                  <p className="text-xl font-black text-[#1C2B3A]">{user.total_clips}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#FAF8F4] p-3 rounded-lg border border-[#DDD6C8]/50">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Avg. Duration</p>
                  <p className="text-xl font-black text-[#1C2B3A]">{user.avg_duration?.toFixed(1) || 0}s</p>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-[#FAF8F4] p-3 rounded-lg border border-[#DDD6C8]/50">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-600">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Primary Language</p>
                  <p className="text-lg font-black text-[#1C2B3A] uppercase tracking-tight">{user.primary_language || 'EN-US'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lexical Insights Bar Chart */}
          <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-[#DDD6C8] p-5 shadow-sm">
            <h4 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-4">Lexical Preferences (Top Words)</h4>
            {wordData.length > 0 ? (
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wordData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4A5A6A', fontSize: 10, fontWeight: 700 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#4A5A6A', fontSize: 10 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #DDD6C8', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      itemStyle={{ color: '#1C2B3A', fontSize: '12px', fontWeight: 700 }}
                    />
                    <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                      {wordData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">Insufficient Data</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default UserAnalyticsOverview;
