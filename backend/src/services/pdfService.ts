import PDFDocument from 'pdfkit';

export interface PDFChallanData {
  challanNumber: string;
  createdAt: Date | string;
  status: string;
  customerName: string;
  businessName: string;
  mobile: string;
  email: string;
  address: string;
  gstNumber?: string | null;
  createdBy: string;
  totalQuantity: number;
  totalAmount: number;
  items: Array<{
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
}

export const generateChallanPDF = (data: PDFChallanData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#1e293b');

      doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('MINI ERP & CRM PORTAL', 55, 52);
      doc.fontSize(10).font('Helvetica').text('Wholesale & Distribution Operations', 55, 76);

      doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold').text('SALES CHALLAN', 400, 52, { align: 'right', width: 140 });
      doc.fontSize(10).font('Helvetica').text(`Status: ${data.status}`, 400, 72, { align: 'right', width: 140 });

      doc.moveDown(3);
      doc.fillColor('#0f172a');

      // Document Meta Info
      const startY = 120;
      doc.fontSize(10).font('Helvetica-Bold').text('Challan Details:', 40, startY);
      doc.font('Helvetica').text(`Challan No: ${data.challanNumber}`, 40, startY + 16);
      doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}`, 40, startY + 30);
      doc.text(`Created By: ${data.createdBy}`, 40, startY + 44);

      doc.font('Helvetica-Bold').text('Customer Details:', 300, startY);
      doc.font('Helvetica-Bold').text(data.businessName || data.customerName, 300, startY + 16);
      doc.font('Helvetica').text(`Contact: ${data.customerName} (${data.mobile})`, 300, startY + 30);
      doc.text(`Email: ${data.email}`, 300, startY + 44);
      doc.text(`Address: ${data.address}`, 300, startY + 58, { width: 255 });
      if (data.gstNumber) {
        doc.text(`GSTIN: ${data.gstNumber}`, 300, startY + 86);
      }

      // Divider Line
      const tableTop = startY + 115;
      doc.moveTo(40, tableTop - 10).lineTo(555, tableTop - 10).stroke('#cbd5e1');

      // Items Table Header
      doc.rect(40, tableTop, 515, 24).fill('#f1f5f9');
      doc.fillColor('#334155').fontSize(10).font('Helvetica-Bold');
      doc.text('#', 45, tableTop + 7, { width: 20 });
      doc.text('Product Name & SKU', 70, tableTop + 7, { width: 220 });
      doc.text('Unit Price', 300, tableTop + 7, { width: 80, align: 'right' });
      doc.text('Qty', 390, tableTop + 7, { width: 60, align: 'right' });
      doc.text('Subtotal (₹)', 460, tableTop + 7, { width: 85, align: 'right' });

      // Table Rows
      let currentY = tableTop + 30;
      doc.font('Helvetica').fontSize(9).fillColor('#0f172a');

      data.items.forEach((item, index) => {
        doc.text(`${index + 1}`, 45, currentY, { width: 20 });
        doc.text(`${item.productName}\n[SKU: ${item.sku}]`, 70, currentY, { width: 220 });
        doc.text(`₹${item.unitPrice.toFixed(2)}`, 300, currentY, { width: 80, align: 'right' });
        doc.text(`${item.quantity}`, 390, currentY, { width: 60, align: 'right' });
        doc.text(`₹${item.subtotal.toFixed(2)}`, 460, currentY, { width: 85, align: 'right' });

        currentY += 28;
        doc.moveTo(40, currentY - 6).lineTo(555, currentY - 6).stroke('#e2e8f0');
      });

      // Total Calculation Summary
      currentY += 10;
      doc.rect(340, currentY, 215, 50).fill('#f8fafc');
      doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10);
      doc.text(`Total Quantity: ${data.totalQuantity}`, 350, currentY + 10);
      doc.fontSize(12).text(`Grand Total: ₹${data.totalAmount.toFixed(2)}`, 350, currentY + 28);

      // Footer
      const footerY = 750;
      doc.moveTo(40, footerY).lineTo(555, footerY).stroke('#cbd5e1');
      doc.fontSize(8).font('Helvetica').fillColor('#64748b');
      doc.text('This is a computer-generated Sales Challan. Authorized sign not required.', 40, footerY + 10, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
