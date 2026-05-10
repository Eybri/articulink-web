"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, FileText, Share2, Printer } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
    
    // Create temporary wrapper for capture
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

      // Apply inlined styles to the clone
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
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      
      let currentY = margin;

      // --- BRANDED HEADER ---
      try {
        const logoImg = new Image();
        logoImg.src = "/images/logo2-nobg.png";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve;
        });
        if (logoImg.complete && logoImg.naturalWidth !== 0) {
          const logoAspect = logoImg.naturalHeight / logoImg.naturalWidth;
          const logoWidth = 12;
          pdf.addImage(logoImg, "PNG", margin, currentY, logoWidth, logoWidth * logoAspect);
        }
      } catch (e) {}

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(30, 30, 30);
      pdf.text("ArticuLink", margin + 15, currentY + 6);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(100, 100, 100);
      pdf.text("ADVANCED CLINICAL SPEECH ANALYTICS PLATFORM", margin + 15, currentY + 10);

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, currentY + 15, pageWidth - margin, currentY + 15);
      currentY += 25;

      // --- REPORT TITLE ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 15, 15);
      pdf.text("SYSTEM INTELLIGENCE OVERVIEW", margin, currentY);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`ISSUED TO: ${user?.first_name?.toUpperCase() || 'SYSTEM ADMINISTRATOR'} | NODE: ART-SYS-MAIN`, margin, currentY + 5);
      currentY += 12;

      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.height / imgProps.width;
      const displayHeight = contentWidth * imgRatio;
      
      pdf.setFillColor(9, 9, 11);
      pdf.rect(margin - 0.5, currentY - 0.5, contentWidth + 1, displayHeight + 1, "F");
      pdf.addImage(imgData, "PNG", margin, currentY, contentWidth, displayHeight);
      
      // --- FOOTER ---
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);
      pdf.text(`Intelligence Report ID: AL-DASH-${Math.random().toString(36).substr(2, 6).toUpperCase()} | Generated: ${timestamp}`, margin, pageHeight - 10);
      pdf.text("Proprietary System Data - Internal Use Only", pageWidth - margin, pageHeight - 10, { align: "right" });

      pdf.save(`articulink_full_intelligence_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Dashboard print failed:", error);
    } finally {
      setIsPrinting(false);
      tempWrapper.remove();
      // Restore console.error if it was patched
      if (typeof window !== 'undefined' && (window as any)._originalConsoleError) {
        console.error = (window as any)._originalConsoleError;
        delete (window as any)._originalConsoleError;
      }
    }
  };

  return (
    <div ref={dashboardRef} className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
        <div>
          <h2 className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">
            System Intelligence
          </h2>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.first_name || user?.email?.split('@')[0] || 'Admin'}
          </h1>
        </div>
        
        <div className="flex gap-3">
           <button 
             onClick={handlePrintAll}
             disabled={isPrinting}
             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95"
           >
              {isPrinting ? (
                <div className="h-3 w-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <Printer size={14} />
              )}
              {isPrinting ? "Processing..." : "Export Report"}
           </button>
           <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">System: Operational</span>
           </div>
        </div>
      </div>

      {/* KPI Section */}
      <StatsCards stats={stats} loading={loading} />

      {/* Top Section: Engagement & Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PlatformEngagementChart />
        </div>
        <div className="lg:col-span-1">
          <SystemHealth />
        </div>
      </div>

      {/* Middle Section: Growth & Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UserGrowthChart />
        </div>
        <div className="lg:col-span-1">
          <ChatActivityChart />
        </div>
      </div>

      {/* Bottom Section: Demographics & User List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <GenderDemographicsChart />
        </div>
        <div className="lg:col-span-1">
          <AgeDistributionChart />
        </div>
        <div className="lg:col-span-1 h-full">
          <DashboardUserList />
        </div>
      </div>
    </div>
  );
}
