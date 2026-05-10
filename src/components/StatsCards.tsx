"use client";

import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Clock,
  TrendingUp,
  TrendingDown,
  RotateCw,
  RefreshCcw,
  Zap
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatsCardsProps {
  stats: any;
  loading?: boolean;
  onRefresh?: () => void;
  onAutoReactivate?: () => void;
}

const StatsCards = ({ 
  stats, 
  loading = false,
  onRefresh,
  onAutoReactivate
} : StatsCardsProps) => {
  const cards = [
    {
      key: 'total_users',
      title: 'Total Users',
      value: stats?.total_users || 0,
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-[#1A4480]',
      textColor: 'text-[#1A4480]',
      progress: 100
    },
    {
      key: 'admins',
      title: 'Administrators',
      value: stats?.by_role?.admin || 0,
      change: '+5%',
      trend: 'up',
      icon: ShieldCheck,
      color: 'bg-[#154D57]',
      textColor: 'text-[#154D57]',
      progress: stats?.total_users ? Math.round((stats.by_role?.admin / stats.total_users) * 100) : 0
    },
    {
      key: 'active_users',
      title: 'Active Users',
      value: stats?.by_status?.active || 0,
      change: '+8%',
      trend: 'up',
      icon: UserCheck,
      color: 'bg-[#2A8FA0]',
      textColor: 'text-[#2A8FA0]',
      progress: stats?.total_users ? Math.round((stats.by_status?.active / stats.total_users) * 100) : 0
    },
    {
      key: 'temp_deactivated',
      title: 'Temp Deactivated',
      value: stats?.by_deactivation_type?.temporary || 0,
      change: '-3%',
      trend: 'down',
      icon: Clock,
      color: 'bg-[#1E6B78]',
      textColor: 'text-[#1E6B78]',
      progress: stats?.total_users ? Math.round((stats.by_deactivation_type?.temporary / stats.total_users) * 100) : 0
    }
  ]

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
         <h4 className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">Network Metrics</h4>
         <div className="flex gap-2">
            {onAutoReactivate && (
              <button 
                onClick={onAutoReactivate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#DDD6C8] text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:text-[#1A4480] hover:bg-[#FAF8F4] transition-all shadow-sm"
              >
                <Zap size={12} />
                Auto-Restore
              </button>
            )}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#DDD6C8] text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:text-[#1A4480] hover:bg-[#FAF8F4] transition-all shadow-sm"
              >
                <RefreshCcw size={12} className={loading ? "animate-spin" : ""} />
                Sync
              </button>
            )}
         </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div 
            key={card.key}
            className="group relative flex flex-col h-[130px] rounded-xl border border-[#DDD6C8] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#2A8FA0]/30"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#4A5A6A] mb-1">
                  {card.title}
                </span>
                <span className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
                  {loading ? "..." : card.value.toLocaleString()}
                </span>
              </div>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border border-[#DDD6C8] bg-[#FAF8F4] text-[#4A5A6A] transition-colors group-hover:text-[#2A8FA0] group-hover:bg-[#2A8FA0]/10")}>
                <card.icon size={18} />
              </div>
            </div>
            
            <div className="mt-auto">
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`text-[10px] font-bold ${card.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                  {card.change}
                </span>
                {card.trend === 'up' ? (
                  <TrendingUp size={12} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={12} className="text-red-500" />
                )}
                <span className="text-[9px] font-medium text-[#4A5A6A] ml-1">
                  vs last period
                </span>
              </div>
              
              <div className="h-1 w-full rounded-full bg-[#FAF8F4] overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 ease-out", card.color)}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsCards;
