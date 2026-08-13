import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const A4 = { w: 210, h: 297 };

async function elementToImage(el: HTMLElement): Promise<string> {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  return canvas.toDataURL("image/jpeg", 0.95);
}

export async function elementToPdfBlob(el: HTMLElement): Promise<Blob> {
  const img = await elementToImage(el);
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  pdf.addImage(img, "JPEG", 0, 0, A4.w, A4.h);
  return pdf.output("blob");
}

export async function elementsToSinglePdfBlob(els: HTMLElement[]): Promise<Blob> {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  for (let i = 0; i < els.length; i++) {
    const el = els[i];
    if (!el) continue;
    const img = await elementToImage(el);
    if (i > 0) pdf.addPage("a4", "portrait");
    pdf.addImage(img, "JPEG", 0, 0, A4.w, A4.h);
  }
  return pdf.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
