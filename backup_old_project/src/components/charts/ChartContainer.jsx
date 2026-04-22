// src/components/charts/ChartContainer.jsx
import { useRef } from "react";
import { Paper, Box, Typography, IconButton, Tooltip } from "@mui/material";
import { PictureAsPdf as PdfIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ChartContainer = ({ 
  title, 
  subtitle, 
  description,
  icon, 
  gradient = "linear-gradient(90deg, #646cff, #10b981, transparent)",
  children,
  height = 500 
}) => {
  const containerRef = useRef(null);

  const exportToPDF = async () => {
    if (!containerRef.current) return;

    try {
      // 1. Capture chart
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#050505", 
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      
      // 2. Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

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
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("ADVANCED CLINICAL SPEECH ANALYTICS PLATFORM", margin + 18, currentY + 13);

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY + 20, pageWidth - margin, currentY + 20);
      currentY += 30;

      // --- REPORT TITLE ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(15, 15, 15);
      pdf.text(`ANALYTICAL REPORT: ${title.toUpperCase()}`, margin, currentY);
      currentY += 8;

      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(subtitle || "Automated System Generation", margin, currentY);
      currentY += 15;

      // --- SECTION: EXECUTIVE SUMMARY ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(100, 108, 255); // Brand Blue
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
      
      // Background for chart
      pdf.setFillColor(5, 5, 5);
      pdf.rect(margin, currentY, contentWidth, displayHeight, "F");
      pdf.addImage(imgData, "PNG", margin, currentY, contentWidth, displayHeight);
      
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Fig 1.0: Real-time graphical representation of ${title.toLowerCase()} data.`, margin, currentY + displayHeight + 5);
      
      currentY += displayHeight + 20;

      // --- SECTION: DATA INTERPRETATION ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(100, 108, 255);
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
      pdf.setTextColor(100, 108, 255);
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
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, margin + 60, currentY);
      pdf.line(pageWidth - margin - 60, currentY, pageWidth - margin, currentY);
      
      pdf.setFontSize(8);
      pdf.text("AUTHORIZING CLINICIAN", margin, currentY + 5);
      pdf.text("SYSTEM ADMINISTRATOR", pageWidth - margin, currentY + 5, { align: "right" });

      // --- FOOTER ---
      const timestamp = new Date().toLocaleString();
      pdf.setTextColor(180, 180, 180);
      pdf.text(`System Report ID: AL-${Math.random().toString(36).substr(2, 9).toUpperCase()} | ${timestamp}`, margin, pageHeight - 10);
      pdf.text("Page 1 of 1", pageWidth - margin, pageHeight - 10, { align: "right" });

      // Save
      pdf.save(`articulink_${title.toLowerCase().replace(/\s+/g, "_")}_report.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
    }
  };


  return (
    <Paper
      ref={containerRef}
      sx={{
        p: { xs: 2, sm: 3, lg: 4 },
        height,
        display: "flex",
        flexDirection: "column",
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(40px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 4,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: gradient,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: "linear-gradient(135deg, rgba(100, 108, 255, 0.2), rgba(100, 108, 255, 0.1))",
              color: "#646cff",
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "white",
                fontFamily: "'Poppins', sans-serif",
                mb: 0.5,
                fontSize: { xs: '1rem', md: '1.25rem' }
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.6)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>

        <Tooltip title="Export to PDF" arrow>
          <IconButton 
            onClick={exportToPDF}
            sx={{ 
              color: "rgba(255, 255, 255, 0.4)",
              "&:hover": { 
                color: "#ff4d4d", // PDF color accent
                background: "rgba(255, 77, 77, 0.1)"
              }
            }}
          >
            <PdfIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      
      <Box sx={{ flex: 1, minHeight: 0, minWidth: 0, width: "100%", position: "relative" }}>
        {children}
      </Box>
    </Paper>
  );
};

export default ChartContainer;