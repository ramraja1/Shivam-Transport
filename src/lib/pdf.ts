import { jsPDF } from 'jspdf';
import { additionalChargeRows, amountInWords, formatCurrency, formatDate, getAdvance, getBalance, getTotal, getTrips, safeNumber, type Bill, type Trip } from '@/lib/bills';

const pageWidth = 210;
const margin = 15;
const contentWidth = pageWidth - margin * 2;
const dark = [63, 70, 75] as const;
const red = [181, 72, 63] as const;

type PdfResult = { blob: Blob; size: number };
const text = (pdf: jsPDF, value: string, x: number, y: number, size = 8, options?: { align?: 'left' | 'center' | 'right'; color?: readonly [number, number, number]; maxWidth?: number }): void => {
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(size);
  pdf.setTextColor(...(options?.color || [32, 38, 43]));
  const lines = options?.maxWidth ? pdf.splitTextToSize(value || '', options.maxWidth) : value || '';
  pdf.text(lines, x, y, { align: options?.align });
};
const line = (pdf: jsPDF, x1: number, y1: number, x2: number, y2: number, width = 0.25): void => { pdf.setDrawColor(...dark); pdf.setLineWidth(width); pdf.line(x1, y1, x2, y2); };
const box = (pdf: jsPDF, x: number, y: number, width: number, height: number, widthLine = 0.25): void => { pdf.setDrawColor(...dark); pdf.setLineWidth(widthLine); pdf.rect(x, y, width, height); };

const drawHeader = (pdf: jsPDF, bill: Bill, pageNumber: number, totalPages: number): number => {
  const y = 14;
  pdf.setDrawColor(...red); pdf.setLineWidth(0.7); pdf.rect(margin, y + 3, 17, 12);
  text(pdf, 'STC', margin + 8.5, y + 11, 10, { align: 'center', color: red });
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(15); pdf.setTextColor(...red); pdf.text(bill.company.companyName || 'SHIVAM TRANSPORT CARRIER', 105, y + 7, { align: 'center' });
  pdf.setFontSize(8); pdf.setTextColor(32, 38, 43); pdf.text('FLEET OWNER & TRANSPORT CONTRACTOR', 105, y + 12, { align: 'center' });
  text(pdf, bill.company.address, 105, y + 17, 7, { align: 'center', maxWidth: 125 });
  text(pdf, `Email ID : ${bill.company.email}`, 105, y + 22, 7, { align: 'center', maxWidth: 125 });
  text(pdf, `Mob : ${bill.company.phone}`, pageWidth - margin, y + 7, 6.5, { align: 'right', maxWidth: 36 });
  text(pdf, 'Transport Bill', pageWidth - margin, y + 17, 7, { align: 'right' });
  line(pdf, margin, y + 27, pageWidth - margin, y + 27);
  const metaY = y + 27;
  const metaH = 22;
  const splitX = 145;
  box(pdf, margin, metaY, contentWidth, metaH);
  line(pdf, splitX, metaY, splitX, metaY + metaH);
  line(pdf, margin, metaY + 7.3, splitX, metaY + 7.3, 0.18); line(pdf, margin, metaY + 14.6, splitX, metaY + 14.6, 0.18);
  text(pdf, `M/s.  ${bill.partyName}`, margin + 3, metaY + 5, 8, { maxWidth: splitX - margin - 6 });
  text(pdf, `Bill No.  ${bill.billNumber}`, splitX + 4, metaY + 5, 8, { color: red });
  text(pdf, `Date :  ${formatDate(bill.billDate)}`, splitX + 4, metaY + 12.2, 8);
  text(pdf, `L.R. No.  ${bill.lrNumber}`, splitX + 4, metaY + 19.5, 8);
  if (totalPages > 1) text(pdf, `Page ${pageNumber} of ${totalPages}`, pageWidth - margin, 9, 6.5, { align: 'right', color: [105, 117, 134] });
  return metaY + metaH + 5;
};

const drawTable = (pdf: jsPDF, bill: Bill, trips: Trip[], y: number, tall: boolean): number => {
  const widths = [22, 27, 31, 36, 36, 28];
  const xs = [margin]; widths.forEach((width) => xs.push(xs[xs.length - 1] + width));
  const headerH = 12;
  const rowH = tall ? 92 : 10;
  const tableHeight = headerH + Math.max(trips.length, 1) * rowH;
  box(pdf, margin, y, contentWidth, tableHeight);
  xs.slice(1, -1).forEach((x) => line(pdf, x, y, x, y + tableHeight, 0.22));
  line(pdf, margin, y + headerH, pageWidth - margin, y + headerH, 0.22);
  text(pdf, 'Date', xs[0] + widths[0] / 2, y + 5, 7, { align: 'center' });
  text(pdf, 'Vehicle No.', xs[1] + widths[1] / 2, y + 5, 7, { align: 'center' });
  text(pdf, 'Container No.', xs[2] + widths[2] / 2, y + 5, 7, { align: 'center' });
  text(pdf, 'DESTINATION', xs[3] + (widths[3] + widths[4]) / 2, y + 4.5, 7, { align: 'center' });
  line(pdf, xs[3], y + 7, xs[5], y + 7, 0.18);
  text(pdf, 'From', xs[3] + widths[3] / 2, y + 10.5, 6.5, { align: 'center' });
  text(pdf, 'To', xs[4] + widths[4] / 2, y + 10.5, 6.5, { align: 'center' });
  text(pdf, 'AMOUNT', xs[5] + widths[5] / 2, y + 4.5, 7, { align: 'center' });
  line(pdf, xs[5], y + 7, xs[6], y + 7, 0.18);
  text(pdf, 'Rs.', xs[5] + widths[5] * 0.35, y + 10.5, 6.5, { align: 'center' });
  text(pdf, 'P.', xs[5] + widths[5] * 0.78, y + 10.5, 6.5, { align: 'center' });
  trips.forEach((trip, index) => {
    const rowY = y + headerH + index * rowH;
    if (index) line(pdf, margin, rowY, pageWidth - margin, rowY, 0.18);
    const cellY = rowY + (tall ? 6 : 6.5);
    text(pdf, formatDate(trip.date), xs[0] + widths[0] / 2, cellY, 6.5, { align: 'center', maxWidth: widths[0] - 3 });
    text(pdf, trip.vehicleNumber, xs[1] + widths[1] / 2, cellY, 6.5, { align: 'center', maxWidth: widths[1] - 3 });
    text(pdf, trip.containerNumber, xs[2] + widths[2] / 2, cellY, 6.5, { align: 'center', maxWidth: widths[2] - 3 });
    text(pdf, trip.from, xs[3] + widths[3] / 2, cellY, 6.5, { align: 'center', maxWidth: widths[3] - 4 });
    text(pdf, trip.to, xs[4] + widths[4] / 2, cellY, 6.5, { align: 'center', maxWidth: widths[4] - 4 });
    text(pdf, formatCurrency(safeNumber(trip.freight)), xs[5] + widths[5] / 2, cellY, 6.5, { align: 'center' });
  });
  return y + tableHeight;
};

const drawSummary = (pdf: jsPDF, bill: Bill, y: number): number => {
  const leftWidth = 112;
  const rightX = margin + leftWidth;
  const rightWidth = contentWidth - leftWidth;
  const rowH = 8;
  const summaryRows = [...additionalChargeRows.map((row) => [row.label, formatCurrency(safeNumber(bill.charges[row.key]))] as [string, string]), ['TOTAL', formatCurrency(getTotal(bill))], ['ADVANCE', formatCurrency(getAdvance(bill))], ['BALANCE', formatCurrency(getBalance(bill))]];
  const summaryH = summaryRows.length * rowH;
  box(pdf, margin, y, leftWidth, summaryH); box(pdf, rightX, y, rightWidth, summaryH);
  for (let i = 1; i < summaryRows.length; i += 1) line(pdf, rightX, y + i * rowH, pageWidth - margin, y + i * rowH, 0.18);
  summaryRows.forEach(([label, value], index) => { const rowY = y + index * rowH; text(pdf, label, rightX + rightWidth / 2, rowY + 5.5, 7, { align: 'center' }); text(pdf, value, pageWidth - margin - 3, rowY + 5.5, 7, { align: 'right' }); });
  text(pdf, bill.company.bankName, margin + 4, y + 10, 8, { color: red, maxWidth: leftWidth - 8 });
  text(pdf, `A/c : ${bill.company.accountNumber}`, margin + 4, y + 18, 8, { color: red });
  text(pdf, `IFSC - ${bill.company.ifsc}`, margin + 4, y + 26, 8, { color: red });
  return y + summaryH;
};

const drawFooter = (pdf: jsPDF, bill: Bill, y: number): void => {
  const wordsH = 16;
  box(pdf, margin, y, contentWidth, wordsH);
  text(pdf, 'Rupees (in words)', margin + 3, y + 6, 7.5); text(pdf, amountInWords(getBalance(bill)), margin + 34, y + 6, 7.5, { maxWidth: contentWidth - 38 });
  line(pdf, margin, y + wordsH, pageWidth - margin, y + wordsH, 0.25);
  text(pdf, `PAN NO. : ${bill.company.pan}`, margin + 3, y + wordsH + 7, 8, { color: red });
  text(pdf, `For ${bill.company.companyName || 'SHIVAM TRANSPORT CARRIER'}`, pageWidth - margin - 3, y + wordsH + 7, 8, { align: 'right', color: red });
  line(pdf, margin, y + wordsH + 11, pageWidth - margin, y + wordsH + 11, 0.25);
  const footerLines = (bill.company.footerNote || '').split('\n');
  footerLines.forEach((footerLine, index) => text(pdf, footerLine, margin, y + wordsH + 17 + index * 4, 6.5, { maxWidth: 105 }));
  text(pdf, 'GST / by Consignor/Consignee', pageWidth - margin, y + wordsH + 19, 8, { align: 'right', color: red });
};

export const generateBillPdf = (bill: Bill): PdfResult => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title: `Shivam Transport Bill ${bill.billNumber}`, subject: 'Transport bill' });
  const trips = getTrips(bill);
  const tall = trips.length === 1;
  const rowsPerPage = tall ? 1 : 12;
  const pageCount = Math.max(1, Math.ceil(trips.length / rowsPerPage));
  for (let page = 0; page < pageCount; page += 1) {
    if (page > 0) pdf.addPage();
    const pageTrips = trips.slice(page * rowsPerPage, (page + 1) * rowsPerPage);
    const tableY = drawHeader(pdf, bill, page + 1, pageCount);
    const tableBottom = drawTable(pdf, bill, pageTrips, tableY, tall);
    if (page === pageCount - 1) { const summaryBottom = drawSummary(pdf, bill, tableBottom); drawFooter(pdf, bill, summaryBottom + 2); }
    else { text(pdf, 'Continued on next page', pageWidth - margin, 285, 7, { align: 'right', color: [105, 117, 134] }); }
  }
  const blob = pdf.output('blob');
  return { blob, size: blob.size };
};
