"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import ChartContainer from "./charts/ChartContainer";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const DashboardUserList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("active");
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [status, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers({
        status: status,
        search: search,
        limit: 10,
      });

      if (response && response.users) {
        setUsers(response.users);
      } else if (Array.isArray(response)) {
        setUsers(response.slice(0, 10));
      }
    } catch (error) {
      console.error("Error fetching dashboard users:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500";
      case "inactive": return "bg-red-500";
      case "pending": return "bg-amber-500";
      default: return "bg-zinc-500";
    }
  };

  const getInitials = (username: string) => {
    if (!username) return "?";
    return username.slice(0, 2).toUpperCase();
  };

  return (
    <ChartContainer 
      title="Access Points" 
      subtitle="Recent operator activities"
      icon={<Users size={20} />}
      height={500}
    >
      <div className="flex flex-col h-full -mt-2">
        {/* Filters */}
        <div className="flex items-center justify-between mb-4 gap-4 px-1">
          <div className="flex gap-1">
            {['active', 'inactive'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  status === s
                    ? (s === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 shadow-lg shadow-emerald-500/10' : 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10')
                    : 'text-white/20 hover:text-white/40'
                )}
              >
                {s === 'active' ? 'Active' : 'Banned'}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-[140px] group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" />
            <input
              type="text"
              placeholder="Filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 rounded-xl border border-white/5 bg-white/5 pl-8 pr-4 text-[10px] font-bold text-white outline-none transition-all focus:border-indigo-400/30 focus:bg-white/10"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-black/80 backdrop-blur-md z-10">
              <tr>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Node</th>
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => router.push('/users')}
                  className="group/row cursor-pointer transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 shrink-0 overflow-hidden rounded-xl border border-white/10 relative shadow-lg group-hover/row:scale-110 transition-transform">
                          {item.profile_pic ? (
                            <img src={item.profile_pic} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-indigo-500/10 text-[10px] font-black text-indigo-400">
                              {getInitials(item.username)}
                            </div>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className="truncate text-xs font-black text-white uppercase tracking-tight">{item.username || item.email.split('@')[0]}</p>
                          <p className="truncate text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] mt-0.5">{item.role}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <div className={cn("h-1 w-1 rounded-full", getStatusColor(item.status))} />
                       <span className={cn("text-[9px] font-black uppercase tracking-widest", item.status === 'active' ? 'text-emerald-500/60' : 'text-red-500/60')}>
                          {item.status}
                       </span>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loading && (
                <tr>
                   <td colSpan={2} className="px-4 py-16 text-center">
                      <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">No localized data found</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </ChartContainer>
  );
};

export default DashboardUserList;
