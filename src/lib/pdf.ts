import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

const A4 = { w: 210, h: 297 };

function paginas(el: HTMLElement): HTMLElement[] {
  const pages = Array.from(el.querySelectorAll<HTMLElement>(".doc-page"));
  return pages.length ? pages : [el];
}

async function elementToImage(el: HTMLElement): Promise<string> {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  return canvas.toDataURL("image/jpeg", 0.95);
}

async function addPages(pdf: jsPDF, el: HTMLElement, primeira: boolean) {
  let first = primeira;
  for (const page of paginas(el)) {
    const img = await elementToImage(page);
    if (!first) pdf.addPage("a4", "portrait");
    pdf.addImage(img, "JPEG", 0, 0, A4.w, A4.h);
    first = false;
  }
}

export async function elementToPdfBlob(el: HTMLElement): Promise<Blob> {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  await addPages(pdf, el, true);
  return pdf.output("blob");
}

export async function elementsToSinglePdfBlob(els: HTMLElement[]): Promise<Blob> {
  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  let primeira = true;
  for (const el of els) {
    if (!el) continue;
    await addPages(pdf, el, primeira);
    primeira = false;
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
