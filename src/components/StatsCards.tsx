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
      color: 'bg-indigo-600',
      textColor: 'text-indigo-400',
      progress: 100
    },
    {
      key: 'admins',
      title: 'Administrators',
      value: stats?.by_role?.admin || 0,
      change: '+5%',
      trend: 'up',
      icon: ShieldCheck,
      color: 'bg-zinc-700',
      textColor: 'text-zinc-400',
      progress: stats?.total_users ? Math.round((stats.by_role?.admin / stats.total_users) * 100) : 0
    },
    {
      key: 'active_users',
      title: 'Active Users',
      value: stats?.by_status?.active || 0,
      change: '+8%',
      trend: 'up',
      icon: UserCheck,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-400',
      progress: stats?.total_users ? Math.round((stats.by_status?.active / stats.total_users) * 100) : 0
    },
    {
      key: 'temp_deactivated',
      title: 'Temp Deactivated',
      value: stats?.by_deactivation_type?.temporary || 0,
      change: '-3%',
      trend: 'down',
      icon: Clock,
      color: 'bg-zinc-800',
      textColor: 'text-zinc-500',
      progress: stats?.total_users ? Math.round((stats.by_deactivation_type?.temporary / stats.total_users) * 100) : 0
    }
  ]

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
         <h4 className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">Network Metrics</h4>
         <div className="flex gap-2">
            {onAutoReactivate && (
              <button 
                onClick={onAutoReactivate}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
              >
                <Zap size={12} />
                Auto-Restore
              </button>
            )}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
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
            className="group relative flex flex-col h-[130px] rounded-xl border border-white/5 bg-zinc-900/50 p-5 backdrop-blur-xl transition-all duration-200 hover:border-white/10"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 mb-1">
                  {card.title}
                </span>
                <span className="text-2xl font-bold text-white tracking-tight">
                  {loading ? "..." : card.value.toLocaleString()}
                </span>
              </div>
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-white/40 transition-colors group-hover:text-indigo-400 group-hover:bg-indigo-400/10")}>
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
                <span className="text-[9px] font-medium text-white/20 ml-1">
                  vs last period
                </span>
              </div>
              
              <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
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
