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
      const canvas = await html2canvas(containerRef.current, {
        backgroundColor: "#050505", // Match dashboard theme
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
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