"use client";

import React, { useState, useEffect } from "react";
import { Search, ChevronRight, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { userAPI } from "@/lib/api";
import ChartContainer from "./charts/ChartContainer";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getImageUrl } from "@/lib/utils";

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

      let fetchedUsers = response && response.users ? response.users : Array.isArray(response) ? response : [];
      
      // Frontend filtering as requested
      fetchedUsers = fetchedUsers.filter((u: any) => {
        const uStatus = u.status || 'active';
        return uStatus === status;
      });

      if (search) {
        const lowerSearch = search.toLowerCase();
        fetchedUsers = fetchedUsers.filter((u: any) => 
          (u.username && u.username.toLowerCase().includes(lowerSearch)) || 
          (u.email && u.email.toLowerCase().includes(lowerSearch))
        );
      }

      setUsers(fetchedUsers.slice(0, 10));
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
      title="Recent Activities" 
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
                  "px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all",
                  status === s
                    ? (s === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm' : 'bg-red-50 text-red-600 border border-red-100 shadow-sm')
                    : 'text-[#4A5A6A] hover:text-[#1C2B3A]'
                )}
              >
                {s === 'active' ? 'Active' : 'Banned'}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-[140px] group">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] group-focus-within:text-[#1A4480] transition-colors" />
            <input
              type="text"
              placeholder="Filter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 rounded-lg border border-[#DDD6C8] bg-[#FAF8F4] pl-8 pr-4 text-[10px] font-bold text-[#1C2B3A] outline-none transition-all focus:border-[#1A4480]/30 focus:bg-white"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-black/10 scrollbar-track-transparent">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-[#FAF8F4]/90 backdrop-blur-md z-10">
              <tr>
                <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-[#4A5A6A]">Operator</th>
                <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-widest text-[#4A5A6A] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C8]/50">
              {users.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => router.push('/users')}
                  className="group/row cursor-pointer transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                       <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg border border-[#DDD6C8] relative shadow-sm group-hover/row:scale-105 transition-transform">
                          {getImageUrl(item.profile_pic) ? (
                            <img src={getImageUrl(item.profile_pic)} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#1A4480]/10 text-[9px] font-bold text-[#1A4480]">
                              {getInitials(item.username)}
                            </div>
                          )}
                       </div>
                       <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-[#1C2B3A] tracking-tight">{item.username || item.email?.split('@')[0] || 'Unknown'}</p>
                          <p className="truncate text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-0.5">{item.role}</p>
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
                      <p className="text-[9px] font-bold text-white/10 uppercase tracking-widest">No localized data found</p>
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
