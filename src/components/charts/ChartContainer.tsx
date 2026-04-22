"use client";

import React, { useRef } from "react";
import { FileText, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  gradient?: string;
  children: React.ReactNode;
  height?: number | string;
}

const ChartContainer = ({ 
  title, 
  subtitle, 
  description,
  icon, 
  gradient = "from-indigo-500 via-emerald-500 to-transparent",
  children,
  height = 500 
}: ChartContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const exportToPDF = async () => {
    if (!containerRef.current) return;

    const stripUnsupportedColorFunctions = (cssText: string) => {
      const declarationRegex = /([a-zA-Z-]+\s*:\s*)([^;{}]*(?:oklch|oklab|lch|lab)\([^;{}]*)(;?)/gi;
      return cssText.replace(declarationRegex, "$1rgb(0,0,0); ");
    };

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

        // Force black background for the root container in the clone
        if (index === 0) {
          styleEntries.push("background-color: #000000 !important;");
          styleEntries.push("color: #ffffff !important;");
          styleEntries.push("border-radius: 40px !important;");
        }

        cloneNode.setAttribute("style", styleEntries.join(" "));
        cloneNode.removeAttribute("class");
      });
    };

    const captureCanvas = async () => {
      try {
        return await html2canvas(containerRef.current!, {
          backgroundColor: "#000000",
          scale: 2,
          logging: false,
          useCORS: true,
          allowTaint: false,
          ignoreElements: (element) => {
            if (!(element instanceof HTMLImageElement)) return false;
            const src = element.currentSrc || element.src || "";
            if (!src) return false;
            if (src.startsWith("data:") || src.startsWith("blob:")) return false;
            try {
              const srcUrl = new URL(src, window.location.origin);
              return srcUrl.origin !== window.location.origin;
            } catch {
              return false;
            }
          },
          onclone: (clonedDoc) => {
            const styleTags = clonedDoc.getElementsByTagName("style");
            for (let i = 0; i < styleTags.length; i++) {
              const style = styleTags[i];
              if (/(lab|lch|okl)/i.test(style.innerHTML)) {
                style.innerHTML = stripUnsupportedColorFunctions(style.innerHTML);
              }
            }

            const problematicElements = clonedDoc.querySelectorAll("[style*='lab'], [style*='lch'], [style*='oklab'], [style*='oklch']");
            problematicElements.forEach((el: any) => {
              const inlineCss = el.getAttribute("style");
              if (inlineCss) {
                el.setAttribute("style", stripUnsupportedColorFunctions(inlineCss));
              }
            });
          }
        });
      } catch (error: any) {
        const message = String(error?.message || "").toLowerCase();
        if (!message.includes("unsupported color function")) {
          throw error;
        }

        // Fallback: clone the chart subtree and inline computed styles to bypass stylesheet color parsing.
        const source = containerRef.current!;
        const tempWrapper = document.createElement("div");
        tempWrapper.style.position = "fixed";
        tempWrapper.style.left = "-10000px";
        tempWrapper.style.top = "0";
        tempWrapper.style.width = `${source.offsetWidth}px`;
        tempWrapper.style.background = "#000000";
        tempWrapper.style.padding = "0";
        tempWrapper.style.margin = "0";
        tempWrapper.style.zIndex = "-1";

        const clonedNode = source.cloneNode(true) as HTMLElement;
        inlineComputedStyles(source, clonedNode);
        tempWrapper.appendChild(clonedNode);
        document.body.appendChild(tempWrapper);

        try {
          return await html2canvas(clonedNode, {
            backgroundColor: "#000000",
            scale: 3, // Increased scale for better quality
            logging: false,
            useCORS: true,
            allowTaint: false,
          });
        } finally {
          tempWrapper.remove();
        }
      }
    };

    try {
      // 1. Capture chart with sanitizer
      const canvas = await captureCanvas();

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
      pdf.text("ADVANCED AI-DRIVEN COMMUNICATION ASSISTANCE PLATFORM", margin + 15, currentY + 10);

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, currentY + 15, pageWidth - margin, currentY + 15);
      currentY += 25;

      // --- REPORT TITLE ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(15, 15, 15);
      pdf.text("USER INTERACTION & ENGAGEMENT INSIGHTS", margin, currentY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`ISSUED TO: SYSTEM ADMINISTRATOR | NODE: ART-COMM-HUB`, margin, currentY + 5);
      currentY += 12;

      // --- THE VISUALIZATION ---
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.height / imgProps.width;
      const displayHeight = contentWidth * imgRatio;
      const imageY = currentY;

      pdf.setFillColor(0, 0, 0);
      pdf.roundedRect(margin, imageY, contentWidth, displayHeight, 4, 4, "F");
      pdf.addImage(imgData, "PNG", margin, imageY, contentWidth, displayHeight);

      currentY = imageY + displayHeight + 10;

      // --- CLEAN REPORT COPY ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(30, 30, 30);
      pdf.text(`ANALYTICAL REPORT: ${title.toUpperCase()}`, margin, currentY);
      currentY += 6;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(90, 90, 90);
      pdf.text(subtitle || "Operational Intelligence Capture", margin, currentY);
      currentY += 10;

      // Generate dynamic content based on the chart title
      let summaryText = description || "";
      let analysisText = "";

      const lowerTitle = title.toLowerCase();
      if (lowerTitle.includes("engagement") || lowerTitle.includes("platform")) {
        summaryText = "This detailed report examines how users interact with the ArticuLink communication ecosystem over time. High engagement metrics reflect successful user adoption and the effectiveness of our AI Assist modules in facilitating daily conversations. By analyzing these interaction peaks, we can optimize server response times to ensure that all users experience seamless, real-time communication support during their busiest hours.";
        analysisText = "Recent data shows a consistent increase in active session length, suggesting that users are finding the communication bridges more useful for complex interactions. We have observed that real-time transcription features are driving a significant portion of platform retention. We recommend introducing more personalized communication shortcuts and AI-driven response suggestions to further streamline the user experience.";
      } else if (lowerTitle.includes("growth") || lowerTitle.includes("user")) {
        summaryText = "This report tracks the expansion of the ArticuLink community and the speed of new user onboarding. Growth is a key indicator of trust in our AI communication tools. The data reflects how ArticuLink is becoming a vital part of daily digital interactions for a growing number of people, ranging from creative professionals to students and global remote teams.";
        analysisText = "User acquisition has reached a new peak, driven largely by word-of-mouth and successful platform integrations. This rapid growth suggests that our focus on low-latency verbal processing is resonating with the market. To maintain this velocity, we should focus on expanding our multilingual support features and improving the accessibility of our mobile communication interface.";
      } else if (lowerTitle.includes("chat") || lowerTitle.includes("activity")) {
        summaryText = "A quantify of the daily conversational volume handled by ArticuLink's AI communication agents. Activity density is a primary measure of how often users rely on ArticuLink for their verbal interactions. This report monitors the frequency and sentiment of these chats, providing insights into how our community is leveraging AI to bridge communication gaps in various social and professional contexts.";
        analysisText = "The analysis shows that chat complexity is increasing as users become more comfortable with the AI-assisted voice models. There is a notable trend toward longer, more naturalistic conversations during evening hours. To support this, we plan to enhance the AI's ability to handle multi-participant group chats and provide more context-aware response templates based on the current communication environment.";
      } else if (lowerTitle.includes("gender") || lowerTitle.includes("demographic")) {
        summaryText = "This report tracks the diversity of our user base to ensure that ArticuLink provides high-quality communication support for everyone. Voice characteristics and communication styles vary across different demographics. Monitoring these splits allows our development team to verify that our speech-to-text models remain highly accurate and inclusive for various vocal frequencies and speaking patterns.";
        analysisText = "The balanced distribution of user engagement across various demographics confirm that our communication models are performing consistently for all voice profiles. We are seeing high reliability in transcription accuracy across all groups. Future updates will focus on further refining dialect-specific voice recognition to ensure that ArticuLink remains the most inclusive communication assist tool on the market.";
      } else if (lowerTitle.includes("age") || lowerTitle.includes("distribution")) {
        summaryText = "This report maps platform usage across different age groups to help us tailor our communication features to every generation. From younger users who prefer rapid, slang-friendly transcription to mature users who value clear and precise vocal assistance, this data helps us maintain a versatile and user-friendly experience that adapts to the communication habits of every individual.";
        analysisText = "Data indicates that the 18-35 age group uses the platform most frequently for short-form messaging, while users over 50 rely on it more for long-form voice calls and detailed dictation. These insights are guiding our next wave of UI updates, which will include customizable 'Mode' settings—allowing users to switch between 'Fast Chat' and 'Formal Dictation' profiles to match their preferred communication style.";
      } else {
        summaryText = description || `This report provides a concise operational view of ${title.toLowerCase()} within the ArticuLink dashboard. The visualization reflects live system activity, recent trends, and the current state of monitored communication workflows.`;
        analysisText = `The data presented emphasizes the visual signal. The accompanying summary reinforces the operational context while keeping the design minimal, readable, and presentation-ready for system auditing and feature planning.`;
      }

      const splitSummary = pdf.splitTextToSize(summaryText, contentWidth);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(45, 45, 45);
      pdf.text("Executive Summary", margin, currentY);
      currentY += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(70, 70, 70);
      pdf.text(splitSummary, margin, currentY);
      currentY += (splitSummary.length * 4.2) + 6;

      const splitAnalysis = pdf.splitTextToSize(analysisText, contentWidth);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(45, 45, 45);
      pdf.text("Data Interpretation & Strategic Analysis", margin, currentY);
      currentY += 5;

      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(70, 70, 70);
      pdf.text(splitAnalysis, margin, currentY);
      currentY += (splitAnalysis.length * 4.2) + 4;

      // --- FOOTER ---
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(7);
      pdf.setTextColor(180, 180, 180);
      pdf.text(`Intelligence Report ID: AL-CHART-${Math.random().toString(36).substr(2, 6).toUpperCase()} | Generated: ${timestamp}`, margin, pageHeight - 10);
      pdf.text("Proprietary System Data - Internal Use Only", pageWidth - margin, pageHeight - 10, { align: "right" });

      pdf.save(`articulink_full_intelligence_${title.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col rounded-[2.5rem] border border-white/5 bg-black p-8 backdrop-blur-3xl overflow-hidden group transition-all duration-500 hover:border-white/10 shadow-2xl"
      style={{ height }}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient} opacity-40 group-hover:opacity-100 transition-opacity`} />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-indigo-400 border border-white/5 shadow-lg group-hover:bg-indigo-500/10 transition-colors">
            {icon || <FileText size={20} />}
          </div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <button 
          onClick={exportToPDF}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/30 transition-all hover:text-indigo-400 hover:bg-white/10 hover:scale-110 active:scale-95"
          title="Secure Capture"
        >
          <Download size={18} />
        </button>
      </div>
      
      <div className="flex-1 w-full flex flex-col relative min-h-0">
        {children}
      </div>
    </div>
  );
};

export default ChartContainer;
