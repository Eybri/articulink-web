"use client";

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  RotateCw, 
  Database, 
  Sparkles, 
  Mic2, 
  HardDrive 
} from "lucide-react";
import { dashboardAPI } from "@/lib/api";

const SystemHealth = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHealth = async () => {
    try {
      setRefreshing(true);
      const data = await dashboardAPI.getSystemHealth();
      setHealthData(data);
    } catch (error) {
      console.error("Failed to fetch system health:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-[200px] rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl flex items-center justify-center">
        <RotateCw size={24} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "online":
      case "configured":
        return <CheckCircle size={18} className="text-emerald-500" />;
      case "degraded":
      case "local_only":
      case "offline":
        return <AlertTriangle size={18} className="text-amber-500" />;
      case "error":
      case "down":
      case "missing_config":
        return <AlertCircle size={18} className="text-red-500" />;
      default:
        return <AlertTriangle size={18} className="text-amber-500" />;
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case "optimal": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "degraded": return "text-amber-400 bg-amber-400/10 border-amber-400/20";
      case "down": return "text-red-400 bg-red-400/10 border-red-400/20";
      default: return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const serviceItems = [
    { name: "Main Database", key: "database", icon: <Database size={18} />, color: "text-indigo-400 bg-indigo-400/10" },
    { name: "Gemini AI", key: "gemini", icon: <Sparkles size={18} />, color: "text-emerald-400 bg-emerald-400/10" },
    { name: "Whisper ASR", key: "whisper", icon: <Mic2 size={18} />, color: "text-amber-400 bg-amber-400/10" },
    { name: "Storage", key: "storage", icon: <HardDrive size={18} />, color: "text-red-400 bg-red-400/10" },
  ];

  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">System Health</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getOverallStatusColor(healthData?.status)} uppercase tracking-wider`}>
              {healthData?.status || 'Active'}
            </span>
          </div>
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest">Real-time infrastructure status</p>
        </div>
        <button 
          onClick={fetchHealth}
          disabled={refreshing}
          className="h-9 w-9 flex items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/40 transition-all hover:text-indigo-400 hover:bg-white/10"
        >
          <RotateCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {serviceItems.map((service) => {
          const statusEntry = healthData?.services[service.key];
          return (
            <div key={service.key} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/5 transition-all hover:bg-white/[0.05]">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${service.color}`}>
                {service.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{service.name}</h4>
                <p className="text-[10px] text-white/40 truncate">
                  {statusEntry?.status === "connected" || statusEntry?.status === "online" || statusEntry?.status === "configured"
                    ? statusEntry?.mode || statusEntry?.model || "Operational"
                    : statusEntry?.detail || "Configuring..."}
                </p>
              </div>
              {getStatusIcon(statusEntry?.status)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SystemHealth;
