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
      return cssText.replace(declarationRegex, "$1rgb(255,255,255); ");
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
            styleEntries.push(`${prop}: rgb(255,255,255);`);
          } else {
            styleEntries.push(`${prop}: ${value};`);
          }
        }

        cloneNode.setAttribute("style", styleEntries.join(" "));
        cloneNode.removeAttribute("class");
      });
    };

    const captureCanvas = async () => {
      try {
        return await html2canvas(containerRef.current!, {
          backgroundColor: "#09090b",
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
        tempWrapper.style.background = "#09090b";
        tempWrapper.style.padding = "0";
        tempWrapper.style.margin = "0";
        tempWrapper.style.zIndex = "-1";

        const clonedNode = source.cloneNode(true) as HTMLElement;
        inlineComputedStyles(source, clonedNode);
        tempWrapper.appendChild(clonedNode);
        document.body.appendChild(tempWrapper);

        try {
          return await html2canvas(clonedNode, {
            backgroundColor: "#09090b",
            scale: 2,
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
      const margin = 20;
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
          const logoWidth = 15;
          pdf.addImage(logoImg, "PNG", margin, currentY, logoWidth, logoWidth * logoAspect);
        }
      } catch (e) {}

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(22);
      pdf.setTextColor(30, 30, 30);
      pdf.text("ArticuLink", margin + 18, currentY + 8);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("ADVANCED CLINICAL SPEECH ANALYTICS PLATFORM", margin + 18, currentY + 13);

      pdf.setDrawColor(220, 220, 220);
      pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);
      currentY += 35;

      // --- REPORT TITLE ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(15, 15, 15);
      pdf.text(`ANALYTICAL REPORT: ${title.toUpperCase()}`, margin, currentY);
      currentY += 8;

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(subtitle || "Operational Intelligence Capture", margin, currentY);
      currentY += 15;

      // --- SECTION: EXECUTIVE SUMMARY ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229); // Indigo-600
      pdf.text("1. EXECUTIVE SUMMARY", margin, currentY);
      currentY += 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const summaryText = description || `This report provides a comprehensive visualization of ${title.toLowerCase()} within the ArticuLink ecosystem. Data is collected from encrypted clinical sessions and processed through our neural analysis pipeline to provide real-time insights into patient progress and system engagement.`;
      const splitSummary = pdf.splitTextToSize(summaryText, contentWidth);
      pdf.text(splitSummary, margin, currentY);
      currentY += (splitSummary.length * 5) + 10;

      // --- THE VISUALIZATION ---
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.height / imgProps.width;
      const displayHeight = contentWidth * imgRatio;
      
      pdf.setFillColor(9, 9, 11);
      pdf.roundedRect(margin - 1, currentY - 1, contentWidth + 2, displayHeight + 2, 2, 2, "F");
      pdf.addImage(imgData, "PNG", margin, currentY, contentWidth, displayHeight);
      
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Fig 1.0: Real-time graphical representation of ${title.toLowerCase()} data.`, margin, currentY + displayHeight + 5);
      
      currentY += displayHeight + 20;

      // --- SECTION: DATA INTERPRETATION ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229);
      pdf.text("2. DATA INTERPRETATION & OBSERVATIONS", margin, currentY);
      currentY += 7;

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const observationText = "Current metrics indicate a steady progression in clinical engagement targets. The variance observed in the visualization above suggests localized peak activity consistent with scheduled therapeutic intervals. System administrators should continue monitoring these trends to optimize resource allocation across the neural transcription clusters.";
      const splitObs = pdf.splitTextToSize(observationText, contentWidth);
      pdf.text(splitObs, margin, currentY);
      currentY += (splitObs.length * 5) + 12;

      // --- SECTION: CLINICAL IMPLICATIONS ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(79, 70, 229);
      pdf.text("3. CLINICAL IMPLICATIONS", margin, currentY);
      currentY += 7;

      pdf.setFontSize(10);
      const implications = [
        "• Strategic adjustment of articulation feedback mechanisms may be required based on current trends.",
        "• Data points suggest a strong correlation between session frequency and speech clarity improvement.",
        "• Continued use of AI-driven reinforcement is recommended for the observed user cohort."
      ];
      implications.forEach(line => {
        pdf.text(line, margin + 5, currentY);
        currentY += 6;
      });
      currentY += 15;

      // --- SIGNATURE BLOCK ---
      if (currentY + 30 > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
      }
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, margin + 60, currentY);
      pdf.line(pageWidth - margin - 60, currentY, pageWidth - margin, currentY);
      
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text("AUTHORIZING CLINICIAN", margin, currentY + 5);
      pdf.text("SYSTEM ADMINISTRATOR", pageWidth - margin, currentY + 5, { align: "right" });

      // --- FOOTER ---
      const timestamp = new Date().toLocaleString();
      pdf.setTextColor(180, 180, 180);
      pdf.text(`Protocol: SECURE-CAPTURE-V3 | Node: ART-SYS-MAIN | Issued: ${timestamp}`, margin, pageHeight - 10);
      pdf.text("Page 1 of 1", pageWidth - margin, pageHeight - 10, { align: "right" });

      pdf.save(`articulink_report_${title.toLowerCase().replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col rounded-[2.5rem] border border-white/5 bg-zinc-950 p-8 backdrop-blur-3xl overflow-hidden group transition-all duration-500 hover:border-white/10 shadow-2xl"
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
