"use client";

import React from "react";
import { X, AlertCircle, CheckCircle2, Trash2, RotateCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmationType = 'danger' | 'warning' | 'success' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: ConfirmationType;
  icon?: React.ReactNode;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm Action",
  cancelLabel = "Cancel",
  type = 'info',
  icon,
  isLoading = false
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: {
      bg: "bg-red-50",
      border: "border-red-100",
      text: "text-red-500",
      btn: "bg-red-600 hover:bg-red-700 shadow-red-600/20",
      icon: <Trash2 size={24} className="text-red-500" />
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-500",
      btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20",
      icon: <AlertCircle size={24} className="text-amber-500" />
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-500",
      btn: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20",
      icon: <CheckCircle2 size={24} className="text-emerald-500" />
    },
    info: {
      bg: "bg-[#1A4480]/5",
      border: "border-[#1A4480]/10",
      text: "text-[#1A4480]",
      btn: "bg-[#1A4480] hover:bg-[#0F2847] shadow-[#1A4480]/20",
      icon: <ShieldCheck size={24} className="text-[#1A4480]" />
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#1C2B3A]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white border border-[#DDD6C8] rounded-2xl p-8 relative shadow-2xl overflow-hidden">
        <div className={cn("absolute top-0 left-0 right-0 h-1 opacity-40", 
          type === 'danger' ? "bg-red-500" : 
          type === 'warning' ? "bg-amber-500" : 
          type === 'success' ? "bg-emerald-500" : "bg-[#1A4480]"
        )} />

        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-8 right-8 text-[#4A5A6A] hover:text-[#1C2B3A] transition-colors disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center border", currentStyle.bg, currentStyle.border)}>
              {icon || currentStyle.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1C2B3A] tracking-tight uppercase">{title}</h3>
              <p className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mt-1">Security Confirmation Required</p>
            </div>
          </div>

          <div className="bg-[#FAF8F4] border border-[#DDD6C8] rounded-xl p-4">
            <p className="text-xs font-medium text-[#4A5A6A] leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest hover:bg-[#FAF8F4] transition-all disabled:opacity-50"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn("px-8 py-3 rounded-xl text-[10px] font-bold text-white uppercase tracking-widest transition-all shadow-lg flex items-center gap-2", 
                currentStyle.btn,
                isLoading && "opacity-80"
              )}
            >
              {isLoading && <RotateCw size={14} className="animate-spin" />}
              {isLoading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
