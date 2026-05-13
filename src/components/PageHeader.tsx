"use client";

import React from "react";

interface PageHeaderProps {
  label: string;
  title: string;
  children?: React.ReactNode;
}

export default function PageHeader({ label, title, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div>
        <h2 className="text-[10px] font-bold text-[#4A5A6A] uppercase tracking-widest mb-1">
          {label}
        </h2>
        <h1 className="text-2xl font-bold text-[#1C2B3A] tracking-tight">
          {title}
        </h1>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
