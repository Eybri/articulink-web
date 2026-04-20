// src/components/charts/ChartContainer.jsx
import { useRef } from "react";
import { Paper, Box, Typography, IconButton, Tooltip } from "@mui/material";
import { PictureAsPdf as PdfIcon } from "@mui/icons-material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ChartContainer = ({ 
  title, 
  subtitle, 
  icon, 
  gradient = "linear-gradient(90deg, #646cff, #10b981, transparent)",
  children,
  height = 500 
}) => {
  const containerRef = useRef(null);

  const exportToPDF = async () => {
    if (!containerRef.current) return;

    try {
      // 1. Capture the chart canvas with a forced dark background for the chart itself
      // (or we can use light if needed, but charts are designed for dark)
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#050505", 
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      
      // 2. Create PDF (A4 Format)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);

      // --- HEADER SECTION ---
      // Add a subtle header line
      pdf.setDrawColor(230, 230, 230);
      pdf.setLineWidth(0.5);
      pdf.line(margin, margin + 20, pageWidth - margin, margin + 20);

      // Add Logo
      try {
        const logoImg = new Image();
        logoImg.src = "/images/logo2-nobg.png";
        await new Promise((resolve) => {
          logoImg.onload = resolve;
          logoImg.onerror = resolve; // Continue even if logo fails
        });
        if (logoImg.complete && logoImg.naturalWidth !== 0) {
          pdf.addImage(logoImg, "PNG", margin, margin, 12, 12);
        }
      } catch (e) {
        console.warn("Logo failed to load for PDF");
      }

      // Add Title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(18);
      pdf.setTextColor(15, 15, 15);
      pdf.text("ArticuLink", margin + 15, margin + 8);
      
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text("Clinical Analytics Report", margin + 15, margin + 13);

      // Add Date/Time
      const timestamp = new Date().toLocaleString();
      pdf.setFontSize(8);
      pdf.text(`Generated: ${timestamp}`, pageWidth - margin, margin + 13, { align: "right" });

      // --- CONTENT SECTION ---
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(14);
      pdf.setTextColor(50, 50, 50);
      pdf.text(title, margin, margin + 30);
      
      if (subtitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(120, 120, 120);
        pdf.text(subtitle, margin, margin + 35);
      }

      // Calculate chart dimensions to fit A4 while maintaining aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.height / imgProps.width;
      const displayHeight = contentWidth * imgRatio;
      
      // Draw a border for the chart to separate it from the white "paper"
      pdf.setDrawColor(240, 240, 240);
      pdf.setFillColor(5, 5, 5); // Chart background
      pdf.rect(margin, margin + 40, contentWidth, displayHeight, "F");
      
      // Add the chart image
      pdf.addImage(imgData, "PNG", margin, margin + 40, contentWidth, displayHeight);

      // --- FOOTER SECTION ---
      pdf.setFontSize(8);
      pdf.setTextColor(180, 180, 180);
      pdf.text("ArticuLink Clinical Monitoring System v2.0.4 • Confidential Property of Eybri", pageWidth / 2, pageHeight - 10, { align: "center" });
      pdf.text(`Page 1/1`, pageWidth - margin, pageHeight - 10, { align: "right" });

      // Save
      pdf.save(`${title.toLowerCase().replace(/\s+/g, "_")}_report.pdf`);
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