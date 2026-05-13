import jsPDF from "jspdf";

interface BrandedHeaderOptions {
  userName?: string;
  reportTitle?: string;
  subtitle?: string;
}

interface FooterOptions {
  prefix?: string;
}

/**
 * Adds the branded ArticuLink header to a jsPDF document.
 * Returns the Y position after the header for subsequent content.
 */
export async function addBrandedHeader(pdf: jsPDF, options: BrandedHeaderOptions = {}): Promise<number> {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  let currentY = margin;

  // Logo
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
  } catch (e) { }

  // Brand name
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.setTextColor(30, 30, 30);
  pdf.text("ArticuLink", margin + 15, currentY + 6);

  // Tagline
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.setTextColor(100, 100, 100);
  pdf.text("ADVANCED COMMUNICATION SPEECH ANALYTICS PLATFORM", margin + 15, currentY + 10);

  // Divider
  pdf.setDrawColor(220, 220, 220);
  pdf.line(margin, currentY + 15, pageWidth - margin, currentY + 15);
  currentY += 25;

  // Report title
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.setTextColor(15, 15, 15);
  pdf.text(options.reportTitle || "SYSTEM INTELLIGENCE OVERVIEW", margin, currentY);

  // Subtitle with user info
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `ISSUED TO: ${(options.userName || "SYSTEM ADMINISTRATOR").toUpperCase()} | NODE: ART-SYS-MAIN`,
    margin,
    currentY + 5
  );
  currentY += 12;

  return currentY;
}

/**
 * Adds the branded footer to a jsPDF document.
 */
export function addBrandedFooter(pdf: jsPDF, options: FooterOptions = {}): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const prefix = options.prefix || "AL-DASH";
  const timestamp = new Date().toLocaleString();

  pdf.setFontSize(7);
  pdf.setTextColor(180, 180, 180);
  pdf.text(
    `Intelligence Report ID: ${prefix}-${Math.random().toString(36).substr(2, 6).toUpperCase()} | Generated: ${timestamp}`,
    margin,
    pageHeight - 10
  );
  pdf.text(
    "Proprietary System Data - Internal Use Only",
    pageWidth - margin,
    pageHeight - 10,
    { align: "right" }
  );
}
