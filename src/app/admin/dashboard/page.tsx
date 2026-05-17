"use client";

import React, { useState, useEffect, useRef } from "react";
import { Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { addBrandedHeader, addBrandedFooter } from "@/lib/pdfUtils";
import PageHeader from "@/components/PageHeader";
import StatsCards from "@/components/StatsCards";
import PlatformEngagementChart from "@/components/charts/PlatformEngagementChart";
import UserGrowthChart from "@/components/charts/UserGrowthChart";
import GenderDemographicsChart from "@/components/charts/GenderDemographicsChart";
import AgeDistributionChart from "@/components/charts/AgeDistributionChart";
import ChatActivityChart from "@/components/charts/ChatActivityChart";
import DashboardUserList from "@/components/DashboardUserList";
import SystemHealth from "@/components/SystemHealth";
import { userAPI, getUser } from "@/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsData = await userAPI.getUserStats();
        setStats(statsData);
        setUser(getUser());
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const inlineComputedStyles = (sourceRoot: HTMLElement, cloneRoot: HTMLElement) => {
    const sourceNodes = [sourceRoot, ...Array.from(sourceRoot.querySelectorAll<HTMLElement>("*"))];
    const cloneNodes = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll<HTMLElement>("*"))];

    sourceNodes.forEach((sourceNode, index) => {
      const cloneNode = cloneNodes[index];
      if (!cloneNode) return;

      const computed = window.getComputedStyle(sourceNode);
      const styleEntries: string[] = [];

      for (let i = 0; i < computed.length; i++) {
        const prop = computed[i];
        const value = computed.getPropertyValue(prop);
        if (!value) continue;
        
        if (/(?:oklch|oklab|lch|lab)\(/i.test(value)) {
          styleEntries.push(`${prop}: rgb(0,0,0);`);
        } else {
          styleEntries.push(`${prop}: ${value};`);
        }
      }

      cloneNode.setAttribute("style", styleEntries.join(" "));
      cloneNode.removeAttribute("class");
    });
  };

  const handlePrintAll = async () => {
    if (!dashboardRef.current) return;
    const source = dashboardRef.current;
    
    const tempWrapper = document.createElement("div");
    tempWrapper.style.position = "fixed";
    tempWrapper.style.left = "-10000px";
    tempWrapper.style.top = "0";
    tempWrapper.style.width = `${source.offsetWidth}px`;
    tempWrapper.style.background = "#09090b";
    tempWrapper.style.padding = "20px";
    tempWrapper.style.zIndex = "-1";

    const clonedNode = source.cloneNode(true) as HTMLElement;
    
    try {
      setIsPrinting(true);
      const originalError = console.error;
      (window as any)._originalConsoleError = originalError;
      console.error = (...args: any[]) => {
        if (typeof args[0] === 'string' && (args[0].includes('unsupported color function') || args[0].includes('oklab'))) return;
        originalError.apply(console, args);
      };

      inlineComputedStyles(source, clonedNode);
      tempWrapper.appendChild(clonedNode);
      document.body.appendChild(tempWrapper);

      const canvas = await html2canvas(clonedNode, {
        scale: 1.5,
        backgroundColor: "#09090b",
        useCORS: true,
        allowTaint: false,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      const currentY = await addBrandedHeader(pdf, {
        userName: user?.first_name || 'SYSTEM ADMINISTRATOR',
      });

      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.height / imgProps.width;
      const displayHeight = contentWidth * imgRatio;
      
      pdf.setFillColor(9, 9, 11);
      pdf.rect(margin - 0.5, currentY - 0.5, contentWidth + 1, displayHeight + 1, "F");
      pdf.addImage(imgData, "PNG", margin, currentY, contentWidth, displayHeight);
      
      addBrandedFooter(pdf, { prefix: "AL-DASH" });

      pdf.save(`articulink_full_intelligence_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Dashboard print failed:", error);
    } finally {
      setIsPrinting(false);
      tempWrapper.remove();
      if (typeof window !== 'undefined' && (window as any)._originalConsoleError) {
        console.error = (window as any)._originalConsoleError;
        delete (window as any)._originalConsoleError;
      }
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      <PageHeader
        label="System Overview"
        title={`Welcome back, ${user?.first_name || user?.email?.split('@')[0] || 'Admin'}`}
      >
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-[#DDD6C8] shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-bold text-[#4A5A6A] uppercase tracking-widest">System: Operational</span>
        </div>

        <button 
          onClick={handlePrintAll}
          disabled={isPrinting}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A4480] text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#0F2847] transition-all shadow-lg shadow-[#1A4480]/20 disabled:opacity-50"
        >
          {isPrinting ? (
            <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <Printer size={14} />
          )}
          {isPrinting ? "Processing..." : "Export Report"}
        </button>
      </PageHeader>

      <StatsCards stats={stats} loading={loading} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2"><PlatformEngagementChart /></div>
        <div className="lg:col-span-1"><SystemHealth /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2"><UserGrowthChart /></div>
        <div className="lg:col-span-1"><ChatActivityChart /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1"><GenderDemographicsChart /></div>
        <div className="lg:col-span-1"><AgeDistributionChart /></div>
        <div className="lg:col-span-1 h-full"><DashboardUserList /></div>
      </div>
    </div>
  );
}
