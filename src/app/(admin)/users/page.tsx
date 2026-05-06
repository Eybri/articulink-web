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
    if (confirm("Permanently erase this operator registry? This action is irreversible.")) {
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
      active: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
      inactive: "bg-red-500/10 text-red-400 border-red-400/20",
      pending: "bg-amber-500/10 text-amber-400 border-amber-400/20",
    };
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", styles[status] || "bg-white/10 text-white/40 border-white/10")}>
        {status}
      </span>
    );
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-red-500/10 text-red-400 border-red-400/20",
      user: "bg-indigo-500/10 text-indigo-400 border-indigo-400/20",
    };
    return (
      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", styles[role] || "bg-white/10 text-white/40 border-white/10")}>
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.3em] mb-1">
            Access Control
          </h2>
          <h1 className="text-4xl font-black text-white tracking-tight">
            User <span className="bg-gradient-to-br from-indigo-400 to-emerald-400 bg-clip-text text-transparent">Management</span>
          </h1>
        </div>
        <div className="flex gap-3">
           <button className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-600/20">
              <UserPlus size={16} />
              Add Operator
           </button>
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
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-all group-focus-within:text-indigo-400" />
            <input 
              type="text" 
              placeholder="Filter by name, email or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-xs font-bold text-white outline-none transition-all focus:bg-white/[0.06] focus:border-indigo-500/50"
            />
          </div>
          
          <select 
            className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white/60 outline-none hover:bg-white/[0.06] hover:text-white transition-all appearance-none"
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
          >
            <option value="" className="bg-zinc-900">All Roles</option>
            <option value="user" className="bg-zinc-900">User</option>
            <option value="admin" className="bg-zinc-900">Admin</option>
          </select>

          <select 
             className="bg-white/[0.03] border border-white/5 rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-widest text-white/60 outline-none hover:bg-white/[0.06] hover:text-white transition-all appearance-none"
             value={filters.status}
             onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
             <option value="" className="bg-zinc-900">All Status</option>
             <option value="active" className="bg-zinc-900">Active</option>
             <option value="inactive" className="bg-zinc-900">Inactive</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
           <button 
             onClick={fetchData} 
             className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/5 text-white/40 hover:text-indigo-400 hover:bg-white/10 transition-all"
           >
              <RotateCw size={18} className={loading ? "animate-spin" : ""} />
           </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="relative rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden group shadow-2xl">
         <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-emerald-500 to-transparent opacity-40" />
         
         <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
            <table className="w-full text-left">
               <thead className="bg-white/[0.01]">
                  <tr>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Identified Operator</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Authorization</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Network Status</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Enrolled On</th>
                     <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {users.map((item) => (
                    <tr key={item.id} className="group/row hover:bg-white/[0.03] transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                           <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center group-hover/row:scale-110 transition-transform overflow-hidden relative shadow-lg">
                              {item.profile_pic ? (
                                <img src={item.profile_pic} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-black text-indigo-400">
                                  {(item.first_name?.[0] || item.username?.[0] || '?').toUpperCase()}
                                </span>
                              )}
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="text-sm font-black text-white truncate uppercase tracking-tight">
                                {item.first_name} {item.last_name || item.username}
                              </span>
                              <span className="text-[10px] font-bold text-white/30 truncate flex items-center gap-1.5 mt-1">
                                <Mail size={10} /> {item.email}
                              </span>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         {getRoleBadge(item.role)}
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col gap-1">
                            {getStatusBadge(item.status)}
                            {item.status === 'inactive' && item.deactivation_end_date && (
                              <span className="text-[9px] font-bold text-amber-500/60 uppercase tracking-widest flex items-center gap-1">
                                 <Clock size={10} /> 
                                 RESTORE: {new Date(item.deactivation_end_date).toLocaleDateString()}
                              </span>
                            )}
                         </div>
                      </td>
                      <td className="px-8 py-6 text-xs font-bold text-white/40 tracking-wider">
                         {formatDate(item.created_at)}
                      </td>
                      <td className="px-8 py-6 text-right">
                         <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            {item.role !== 'admin' && (
                              item.status === 'active' ? (
                                <button 
                                  onClick={() => { setSelectedUser(item); setShowDeactivateModal(true); }}
                                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-amber-500/5 text-amber-500/40 hover:text-amber-500 hover:bg-amber-500/10 transition-all tooltip"
                                  title="Deactivate Operator"
                                >
                                   <Ban size={14} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => handleActivate(item.id)}
                                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500/5 text-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                  title="Restore Access"
                                >
                                   <Unlock size={14} />
                                </button>
                              )
                            )}
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-500/5 text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                              title="Purge Registry"
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

         <div className="p-8 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">
               Displaying {users.length} of {totalUsers} registry entries
            </p>
            <div className="flex items-center gap-1">
               <button 
                 disabled={page === 0}
                 onClick={() => setPage(p => p - 1)}
                 className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
               >
                  Prev
               </button>
               <button 
                 disabled={(page + 1) * rowsPerPage >= totalUsers}
                 onClick={() => setPage(p => p + 1)}
                 className="px-4 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/10 disabled:opacity-20 transition-all"
               >
                  Next
               </button>
            </div>
         </div>
      </div>

      {/* DEACTIVATE MODAL */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[3rem] p-10 relative shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-transparent opacity-40" />
              
              <button 
                onClick={() => setShowDeactivateModal(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                 <X size={24} />
              </button>

              <div className="space-y-8">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                       <ShieldAlert size={28} className="text-amber-500" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white tracking-tight uppercase">Registry Suspension</h3>
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mt-1">Operator: {selectedUser?.first_name} {selectedUser?.last_name}</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setDeactivationData({...deactivationData, deactivation_type: 'temporary'})}
                         className={cn(
                           "p-5 rounded-[2rem] border transition-all text-left group",
                           deactivationData.deactivation_type === 'temporary' 
                             ? "bg-amber-500/10 border-amber-500/50 text-amber-400" 
                             : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]"
                         )}
                       >
                          <Clock size={18} className="mb-2" />
                          <h5 className="text-[10px] font-black uppercase tracking-widest">Temporary</h5>
                          <p className="text-[9px] font-bold opacity-60 uppercase mt-1">Automatic Restore</p>
                       </button>

                       <button 
                         onClick={() => setDeactivationData({...deactivationData, deactivation_type: 'permanent'})}
                         className={cn(
                           "p-5 rounded-[2rem] border transition-all text-left group",
                           deactivationData.deactivation_type === 'permanent' 
                             ? "bg-red-500/10 border-red-500/50 text-red-500" 
                             : "bg-white/[0.02] border-white/5 text-white/40 hover:bg-white/[0.05]"
                         )}
                       >
                          <Ban size={18} className="mb-2" />
                          <h5 className="text-[10px] font-black uppercase tracking-widest">Permanent</h5>
                          <p className="text-[9px] font-bold opacity-60 uppercase mt-1">Manual Unlock</p>
                       </button>
                    </div>

                    {deactivationData.deactivation_type === 'temporary' && (
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4 block">Suspension Duration</label>
                          <select 
                             className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:bg-white/[0.06] focus:border-amber-500/50 appearance-none"
                             value={deactivationData.duration}
                             onChange={(e) => setDeactivationData({...deactivationData, duration: e.target.value})}
                          >
                             <option value="1day" className="bg-zinc-900">24 Standard Hours</option>
                             <option value="1week" className="bg-zinc-900">7 Operational Days</option>
                             <option value="1month" className="bg-zinc-900">30 Neural Cycles</option>
                             <option value="1year" className="bg-zinc-900">365 Standard Days</option>
                          </select>
                       </div>
                    )}

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-4 block">Violation Category</label>
                       <select 
                          className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-xs font-black uppercase tracking-widest text-white outline-none focus:bg-white/[0.06] focus:border-amber-500/50 appearance-none"
                          value={deactivationData.reason_category}
                          onChange={(e) => setDeactivationData({...deactivationData, reason_category: e.target.value})}
                       >
                          <option value="Spamming" className="bg-zinc-900">Data Redundancy (Spam)</option>
                          <option value="Inappropriate Content" className="bg-zinc-900">Protocol Violation (Inappropriate)</option>
                          <option value="Policy Violation" className="bg-zinc-900">Governance Breach (Policy)</option>
                          <option value="Other" className="bg-zinc-900">Anomalous Activity (Other)</option>
                       </select>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3 pt-4">
                    <button 
                      onClick={() => setShowDeactivateModal(false)}
                      className="px-8 py-4 rounded-2xl bg-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all underline underline-offset-4"
                    >
                       Cancel Sequence
                    </button>
                    <button 
                      onClick={handleDeactivateSubmit}
                      className="px-10 py-4 rounded-2xl bg-amber-600 text-[10px] font-black text-white uppercase tracking-[0.2rem] hover:scale-105 transition-all shadow-xl shadow-amber-600/20"
                    >
                       Execute Suspension
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
