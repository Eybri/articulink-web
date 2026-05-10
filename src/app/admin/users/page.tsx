"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  RotateCw, 
  Trash2, 
  UserPlus, 
  Mail, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Ban,
  Unlock,
  Clock,
  AlertCircle,
  X,
  MoreVertical,
  Check
} from "lucide-react";
import { userAPI } from "@/lib/api";
import StatsCards from "@/components/StatsCards";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getImageUrl } from "@/lib/utils";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    role: "",
    status: ""
  });
  const [search, setSearch] = useState("");

  // Deactivation Dialog State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deactivationData, setDeactivationData] = useState({
    deactivation_type: 'temporary',
    duration: '1day',
    reason_category: 'Spamming',
    deactivation_reason: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUsers({
        ...filters,
        search,
        skip: page * rowsPerPage,
        limit: rowsPerPage
      });

      if (response && response.users) {
        setUsers(response.users);
        setTotalUsers(response.total || 0);
      } else if (Array.isArray(response)) {
        setUsers(response);
        setTotalUsers(response.length);
      }

      const statsData = await userAPI.getUserStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters, page, rowsPerPage, search]);

  const handleActivate = async (userId: string) => {
    try {
      await userAPI.activateUser(userId);
      fetchData();
    } catch (err) {
      console.error("Activation failed:", err);
    }
  };

  const handleDeactivateSubmit = async () => {
    if (!selectedUser) return;
    try {
      const apiData = {
        ...deactivationData,
        deactivation_reason: deactivationData.deactivation_reason 
          ? `[${deactivationData.reason_category}] ${deactivationData.deactivation_reason}`
          : deactivationData.reason_category
      };
      await userAPI.deactivateUser(selectedUser.id, apiData);
      setShowDeactivateModal(false);
      fetchData();
    } catch (err) {
      console.error("Deactivation failed:", err);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Permanently delete this user account? This action cannot be undone.")) {
      try {
        await userAPI.deleteUser(userId);
        fetchData();
      } catch (err) {
        console.error("Delete failed:", err);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-emerald-50 text-emerald-600 border-emerald-100",
      inactive: "bg-red-50 text-red-600 border-red-100",
      pending: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border", styles[status] || "bg-zinc-50 text-zinc-600 border-zinc-100")}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-red-50 text-red-600 border-red-100",
      user: "bg-[#1A4480]/5 text-[#1A4480] border-[#1A4480]/10",
    };
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border", styles[role] || "bg-zinc-50 text-zinc-600 border-zinc-100")}>
        {role}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-1">
            Access Control
          </h2>
          <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
            User Management
          </h1>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards 
        stats={stats} 
        loading={loading} 
        onAutoReactivate={async () => {
          const res = await userAPI.triggerAutoReactivate();
          alert(`Auto-reactivation sequence complete: ${res.reactivated_count} nodes restored.`);
          fetchData();
        }}
        onRefresh={fetchData}
      />

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A5A6A] group-focus-within:text-[#1A4480] transition-colors" />
            <input
              type="text"
              placeholder="Search user accounts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#DDD6C8] rounded-xl text-sm font-medium text-[#1C2B3A] outline-none transition-all focus:border-[#1A4480]/30 focus:bg-white shadow-sm"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={fetchData}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#DDD6C8] text-[#4A5A6A] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#FAF8F4] transition-all shadow-sm"
            >
              <RotateCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1A4480] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0F2847] transition-all shadow-lg shadow-[#1A4480]/20"
            >
              <UserPlus size={16} />
              Add User
            </button>
          </div>
        </div>

      {/* Table Container */}
      <div className="bg-white border border-[#DDD6C8] rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DDD6C8] bg-[#FAF8F4]/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">User Account</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">System Role</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">Current Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A]">Identifier</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#4A5A6A] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDD6C8]/30">
                   {users.map((item) => (
                    <tr key={item.id} className="group/row hover:bg-[#FAF8F4]/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-9 w-9 rounded-lg bg-[#FAF8F4] border border-[#DDD6C8] flex items-center justify-center overflow-hidden relative shadow-inner">
                              {getImageUrl(item.profile_pic) ? (
                                <img src={getImageUrl(item.profile_pic)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-[11px] font-bold text-[#1A4480]">
                                  {(item.first_name?.[0] || item.username?.[0] || '?').toUpperCase()}
                                </span>
                              )}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="text-xs font-bold text-[#1C2B3A] truncate tracking-tight">
                                {item.first_name} {item.last_name || item.username}
                              </span>
                              <span className="text-[10px] font-medium text-[#4A5A6A] truncate">
                                {item.email}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         {getRoleBadge(item.role)}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-1">
                            {getStatusBadge(item.status)}
                         </div>
                      </td>
                       <td className="px-6 py-4 text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest">
                         {formatDate(item.created_at)}
                       </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                             {item.role !== 'admin' && (
                              item.status === 'active' ? (
                                <button 
                                  onClick={() => { setSelectedUser(item); setShowDeactivateModal(true); }}
                                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-amber-50 text-amber-500 border border-amber-100 hover:bg-amber-100 transition-all"
                                  title="Deactivate"
                                >
                                   <Ban size={14} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleActivate(item.id)}
                                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 border border-emerald-100 hover:bg-emerald-100 transition-all"
                                  title="Activate"
                                >
                                   <Unlock size={14} />
                                </button>
                              )
                            )}
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="h-8 w-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 border border-red-100 hover:bg-red-100 transition-all"
                              title="Delete"
                            >
                               <Trash2 size={14} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

          <div className="p-8 border-t border-[#DDD6C8] flex items-center justify-between bg-[#FAF8F4]/30">
            <p className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">
               Displaying {users.length} of {totalUsers} registry entries
            </p>
            <div className="flex items-center gap-1">
               <button 
                 disabled={page === 0}
                 onClick={() => setPage(p => p - 1)}
                 className="px-4 py-2 rounded-lg border border-[#DDD6C8] bg-white text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] disabled:opacity-50 transition-all shadow-sm"
               >
                  Prev
               </button>
               <button 
                 disabled={(page + 1) * rowsPerPage >= totalUsers}
                 onClick={() => setPage(p => p + 1)}
                 className="px-4 py-2 rounded-lg border border-[#DDD6C8] bg-white text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] disabled:opacity-50 transition-all shadow-sm"
               >
                  Next
               </button>
            </div>
         </div>
      </div>

      {/* DEACTIVATE MODAL */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2B3A]/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-white border border-[#DDD6C8] rounded-2xl p-8 relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-transparent opacity-40" />
              
              <button 
                onClick={() => setShowDeactivateModal(false)}
                className="absolute top-8 right-8 text-[#4A5A6A] hover:text-[#1C2B3A] transition-colors"
              >
                 <X size={20} />
              </button>

              <div className="space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                       <ShieldAlert size={24} className="text-amber-500" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-[#1C2B3A] tracking-tight uppercase">Deactivate Operator</h3>
                       <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-1">Operator: {selectedUser?.first_name} {selectedUser?.last_name}</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setDeactivationData({...deactivationData, deactivation_type: 'temporary'})}
                         className={cn(
                           "p-4 rounded-xl border transition-all text-left group",
                           deactivationData.deactivation_type === 'temporary' 
                             ? "bg-amber-50 border-amber-500/30 text-amber-600" 
                             : "bg-[#FAF8F4] border-[#DDD6C8] text-[#4A5A6A] hover:bg-white hover:border-[#1A4480]/30"
                         )}
                       >
                          <Clock size={18} className="mb-2" />
                          <h5 className="text-[10px] font-bold uppercase tracking-widest">Temporary</h5>
                          <p className="text-[9px] font-medium opacity-60 uppercase mt-1">Automatic Restore</p>
                       </button>

                       <button 
                         onClick={() => setDeactivationData({...deactivationData, deactivation_type: 'permanent'})}
                         className={cn(
                           "p-4 rounded-xl border transition-all text-left group",
                           deactivationData.deactivation_type === 'permanent' 
                             ? "bg-red-50 border-red-500/30 text-red-600" 
                             : "bg-[#FAF8F4] border-[#DDD6C8] text-[#4A5A6A] hover:bg-white hover:border-[#1A4480]/30"
                         )}
                       >
                          <Ban size={18} className="mb-2" />
                          <h5 className="text-[10px] font-bold uppercase tracking-widest">Permanent</h5>
                          <p className="text-[9px] font-medium opacity-60 uppercase mt-1">Manual Unlock</p>
                       </button>
                    </div>

                    {deactivationData.deactivation_type === 'temporary' && (
                       <div className="space-y-2">
                          <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">Suspension Duration</label>
                          <select 
                             className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 appearance-none shadow-sm"
                             value={deactivationData.duration}
                             onChange={(e) => setDeactivationData({...deactivationData, duration: e.target.value})}
                          >
                             <option value="1day">24 Standard Hours</option>
                             <option value="1week">7 Operational Days</option>
                             <option value="1month">30 Neural Cycles</option>
                             <option value="1year">365 Standard Days</option>
                          </select>
                       </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">Violation Category</label>
                       <select 
                          className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 appearance-none shadow-sm"
                          value={deactivationData.reason_category}
                          onChange={(e) => setDeactivationData({...deactivationData, reason_category: e.target.value})}
                       >
                          <option value="Spamming">Data Redundancy (Spam)</option>
                          <option value="Inappropriate Content">Protocol Violation (Inappropriate)</option>
                          <option value="Policy Violation">Governance Breach (Policy)</option>
                          <option value="Other">Anomalous Activity (Other)</option>
                       </select>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setShowDeactivateModal(false)}
                      className="px-8 py-4 rounded-xl text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] transition-all"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={handleDeactivateSubmit}
                      className="px-10 py-4 rounded-xl bg-amber-600 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
                    >
                       Confirm Deactivation
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
