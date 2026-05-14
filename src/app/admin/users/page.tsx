"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  RotateCw,
  Trash2,
  UserPlus,
  Ban,
  Unlock,
  Timer
} from "lucide-react";
import { userAPI } from "@/lib/api";
import { cn, formatCountdown, formatDate } from "@/lib/utils";
import StatsCards from "@/components/StatsCards";
import UserAvatar from "@/components/UserAvatar";
import PageHeader from "@/components/PageHeader";
import DeactivateModal from "@/components/DeactivateModal";
import type { DeactivationData } from "@/components/DeactivateModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import type { ConfirmationType } from "@/components/ConfirmationModal";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({ role: "", status: "" });
  const [search, setSearch] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  // Deactivation Dialog State
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [now, setNow] = useState(new Date());

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: ConfirmationType;
    confirmLabel: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: 'info',
    confirmLabel: "Confirm"
  });

  const closeConfirmModal = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    const timer = setTimeout(() => { fetchData(); }, 500);
    return () => clearTimeout(timer);
  }, [filters, page, rowsPerPage, search]);

  const handleActivate = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Activate User",
      message: "Are you sure you want to restore full system access for this user account? This will allow them to log in and use all features.",
      type: 'success',
      confirmLabel: "Restore Access",
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          await userAPI.activateUser(userId);
          await fetchData();
          closeConfirmModal();
        } catch (err) {
          console.error("Activation failed:", err);
        } finally {
          setIsConfirming(false);
        }
      }
    });
  };

  const handleDeactivateSubmit = async (deactivationData: DeactivationData) => {
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

  const handleDelete = (userId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Account",
      message: "WARNING: You are about to permanently purge this user account from the central registry. This action is irreversible and all associated data will be lost.",
      type: 'danger',
      confirmLabel: "Purge Account",
      onConfirm: async () => {
        try {
          setIsConfirming(true);
          await userAPI.deleteUser(userId);
          await fetchData();
          closeConfirmModal();
        } catch (err) {
          console.error("Delete failed:", err);
        } finally {
          setIsConfirming(false);
        }
      }
    });
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader label="Access Control" title="User Management" />

      <StatsCards
        stats={stats}
        loading={loading}
        onAutoReactivate={() => {
          setConfirmModal({
            isOpen: true,
            title: "Auto-Reactivation",
            message: "Execute global protocol to automatically restore all accounts whose temporary suspension period has expired? This may affect multiple records.",
            type: 'info',
            confirmLabel: "Execute Protocol",
            onConfirm: async () => {
              try {
                setIsConfirming(true);
                const res = await userAPI.triggerAutoReactivate();
                alert(`Auto-reactivation sequence complete: ${res.reactivated_count} nodes restored.`);
                await fetchData();
                closeConfirmModal();
              } catch (err) {
                console.error("Auto-reactivate failed:", err);
              } finally {
                setIsConfirming(false);
              }
            }
          });
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
          <button onClick={fetchData} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-[#DDD6C8] text-[#4A5A6A] rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#FAF8F4] transition-all shadow-sm">
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#1A4480] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#0F2847] transition-all shadow-lg shadow-[#1A4480]/20">
            <UserPlus size={16} />
            Add User
          </button>
        </div>
      </div>

      {/* Table */}
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
                      <UserAvatar
                        src={item.profile_pic}
                        fallback={(item.first_name?.[0] || item.username?.[0] || '?')}
                        size="sm"
                      />
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
                  <td className="px-6 py-4">{getRoleBadge(item.role)}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(item.status)}
                      {(item.status === 'inactive' || item.is_active === false) && item.deactivation_type === 'temporary' && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 w-fit">
                          <Timer size={10} className="animate-pulse" />
                          <span className="text-[8px] font-bold uppercase">{formatCountdown(item.deactivation_end_date, now)}</span>
                        </div>
                      )}
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

      <DeactivateModal
        isOpen={showDeactivateModal}
        targetUser={selectedUser}
        onClose={() => setShowDeactivateModal(false)}
        onSubmit={handleDeactivateSubmit}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmLabel={confirmModal.confirmLabel}
        onConfirm={confirmModal.onConfirm}
        onClose={closeConfirmModal}
        isLoading={isConfirming}
      />
    </div>
  );
}
