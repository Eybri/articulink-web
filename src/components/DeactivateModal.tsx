"use client";

import React, { useState } from "react";
import { X, Clock, Ban, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeactivateModalProps {
  isOpen: boolean;
  targetUser: any;
  onClose: () => void;
  onSubmit: (data: DeactivationData) => void;
}

export interface DeactivationData {
  deactivation_type: string;
  duration: string;
  reason_category: string;
  deactivation_reason: string;
}

const DEFAULT_DATA: DeactivationData = {
  deactivation_type: 'temporary',
  duration: '1day',
  reason_category: 'Inappropriate Content',
  deactivation_reason: ''
};

export default function DeactivateModal({ isOpen, targetUser, onClose, onSubmit }: DeactivateModalProps) {
  const [data, setData] = useState<DeactivationData>({ ...DEFAULT_DATA });

  if (!isOpen) return null;

  const displayName = targetUser?.user_info?.username
    || `${targetUser?.first_name || ''} ${targetUser?.last_name || ''}`.trim()
    || targetUser?.username
    || 'Unknown';

  const handleSubmit = () => {
    onSubmit(data);
    setData({ ...DEFAULT_DATA });
  };

  const handleClose = () => {
    setData({ ...DEFAULT_DATA });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1C2B3A]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-lg bg-white border border-[#DDD6C8] rounded-2xl p-8 relative shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-transparent opacity-40" />

        <button
          onClick={handleClose}
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
              <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-1">Operator: {displayName}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setData({ ...data, deactivation_type: 'temporary' })}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left group",
                  data.deactivation_type === 'temporary'
                    ? "bg-amber-50 border-amber-500/30 text-amber-600"
                    : "bg-[#FAF8F4] border-[#DDD6C8] text-[#4A5A6A] hover:bg-white hover:border-[#1A4480]/30"
                )}
              >
                <Clock size={18} className="mb-2" />
                <h5 className="text-[10px] font-bold uppercase tracking-widest">Temporary</h5>
                <p className="text-[9px] font-medium opacity-60 uppercase mt-1">Automatic Restore</p>
              </button>

              <button
                onClick={() => setData({ ...data, deactivation_type: 'permanent' })}
                className={cn(
                  "p-4 rounded-xl border transition-all text-left group",
                  data.deactivation_type === 'permanent'
                    ? "bg-red-50 border-red-500/30 text-red-600"
                    : "bg-[#FAF8F4] border-[#DDD6C8] text-[#4A5A6A] hover:bg-white hover:border-[#1A4480]/30"
                )}
              >
                <Ban size={18} className="mb-2" />
                <h5 className="text-[10px] font-bold uppercase tracking-widest">Permanent</h5>
                <p className="text-[9px] font-medium opacity-60 uppercase mt-1">Manual Unlock</p>
              </button>
            </div>

            {data.deactivation_type === 'temporary' && (
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest ml-4 block">Suspension Duration</label>
                <select
                  className="w-full bg-[#FAF8F4] border border-[#DDD6C8] rounded-xl p-4 text-xs font-bold uppercase tracking-widest text-[#1C2B3A] outline-none focus:bg-white focus:border-[#1A4480]/30 appearance-none shadow-sm"
                  value={data.duration}
                  onChange={(e) => setData({ ...data, duration: e.target.value })}
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
                value={data.reason_category}
                onChange={(e) => setData({ ...data, reason_category: e.target.value })}
              >
                <option value="Inappropriate Content">Protocol Violation (Inappropriate)</option>
                <option value="Spamming">Data Redundancy (Spam)</option>
                <option value="Policy Violation">Governance Breach (Policy)</option>
                <option value="Other">Anomalous Activity (Other)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleClose}
              className="px-8 py-4 rounded-xl text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-10 py-4 rounded-xl bg-amber-600 text-[10px] font-bold text-white uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20"
            >
              Confirm Deactivation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
