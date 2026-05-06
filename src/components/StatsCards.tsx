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
      color: 'bg-indigo-500',
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
      color: 'bg-red-500',
      textColor: 'text-red-400',
      progress: stats?.total_users ? Math.round((stats.by_role?.admin / stats.total_users) * 100) : 0
    },
    {
      key: 'active_users',
      title: 'Active Users',
      value: stats?.by_status?.active || 0,
      change: '+8%',
      trend: 'up',
      icon: UserCheck,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
      progress: stats?.total_users ? Math.round((stats.by_status?.active / stats.total_users) * 100) : 0
    },
    {
      key: 'temp_deactivated',
      title: 'Temp Deactivated',
      value: stats?.by_deactivation_type?.temporary || 0,
      change: '-3%',
      trend: 'down',
      icon: Clock,
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
      progress: stats?.total_users ? Math.round((stats.by_deactivation_type?.temporary / stats.total_users) * 100) : 0
    }
  ]

  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center justify-between">
         <h4 className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Network Pulse</h4>
         <div className="flex gap-2">
            {onAutoReactivate && (
              <button 
                onClick={onAutoReactivate}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:bg-amber-500/20 transition-all"
                title="Trigger automated node restoration"
              >
                <Zap size={14} />
                Auto-Restore
              </button>
            )}
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all"
              >
                <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                Sync
              </button>
            )}
         </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div 
            key={card.key}
            className="group relative flex flex-col h-[150px] rounded-3xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-white/[0.08] hover:shadow-2xl shadow-indigo-500/5"
          >
            {loading && (
               <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
                  <div className={`h-full ${card.color} animate-shimmer`} style={{ width: '40%' }} />
               </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">
                  {card.title}
                </span>
                <span className="text-3xl font-black text-white tracking-tight">
                  {loading ? "..." : card.value.toLocaleString()}
                </span>
              </div>
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg transition-transform duration-500 group-hover:scale-110", card.color + "/10", card.textColor)}>
                <card.icon size={22} />
              </div>
            </div>
            
            <div className="mt-auto items-end">
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`text-xs font-bold ${card.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                  {card.change}
                </span>
                {card.trend === 'up' ? (
                  <TrendingUp size={14} className="text-emerald-400" />
                ) : (
                  <TrendingDown size={14} className="text-red-400" />
                )}
                <span className="text-[10px] font-medium text-white/30 ml-1">
                  vs last week
                </span>
              </div>
              
              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
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
