/* eslint-disable no-console */
import PDFDocument from "pdfkit";
import AppError from "../app/errorHelpers/AppError";
import httpStatus from "http-status-codes";

export interface IInvoiceData {
  transactionID: string;
  bookingDate: Date;
  userName: string;
  tourTitle: string;
  guestCount: number;
  totalAmount: number;
}

// Helper: currency + date formatting for Bangladeshi Taka
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(amount);

const formatDate = (date: Date, locale = "en-GB") =>
  new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "2-digit" }).format(date);

// Draw a light horizontal rule
const hr = (doc: InstanceType<typeof PDFDocument>, y: number) => {
  doc
    .save()
    .lineWidth(1)
    .strokeColor("#e5e7eb")
    .moveTo(50, y)
    .lineTo(545, y)
    .stroke()
    .restore();
};


export const generatePDF = async (invoiceData: IInvoiceData): Promise<Buffer> => {
  try {
    const { transactionID, bookingDate, userName, tourTitle, guestCount, totalAmount } = invoiceData;

    const buffer: Uint8Array[] = [];

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      // Collect stream into memory
      doc.on("data", (chunk) => buffer.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffer)));
      doc.on("error", (err) => reject(err));

      // Styles
      doc.registerFont("Helvetica", "Helvetica");
      doc.registerFont("Helvetica-Bold", "Helvetica-Bold");

      doc
        .font("Helvetica-Bold").fontSize(18)
        .text("PH Tour Management System", 50, 50);

      doc.font("Helvetica").fontSize(10).fillColor("#4b5563");
      doc.text("Dhaka, Bangladesh", 120, 65);
      doc.text("Phone: +8801988474979", 120, 80);
      doc.text("Website: www.phtms.com", 120, 95);
      doc.fillColor("#000000");

      doc.font("Helvetica-Bold").fontSize(24).text("Invoice", { align: "right" });
      hr(doc, 120);

      // Invoice meta
      const leftY = 140;
      doc.font("Helvetica-Bold").fontSize(12).text("Billed To", 50, leftY);
      doc.font("Helvetica").fontSize(12).text(userName, 50, leftY + 18);

      const rightX = 320;
      doc.font("Helvetica-Bold").text("Invoice Details", rightX, leftY);
      doc.font("Helvetica").text(`Transaction ID: ${transactionID}`, rightX, leftY + 18);
      doc.text(`Booking Date: ${formatDate(bookingDate)}`, rightX, leftY + 36);

      hr(doc, 200);

      // Line items table
      const tableTop = 220;
      const colX = { item: 50, qty: 330, price: 400, total: 480 } as const;

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Description", colX.item, tableTop);
      doc.text("Guests", colX.qty, tableTop, { width: 50, align: "right" });
      doc.text("Price", colX.price, tableTop, { width: 60, align: "right" });
      doc.text("Amount", colX.total, tableTop, { width: 60, align: "right" });

      hr(doc, tableTop + 18);

      // Single row based on provided structure
      const rowY = tableTop + 32;
      const unitPrice = guestCount > 0 ? totalAmount / guestCount : totalAmount;

      doc.font("Helvetica").fontSize(12);
      doc.text(tourTitle, colX.item, rowY, { width: 260 });
      doc.text(String(guestCount), colX.qty, rowY, { width: 50, align: "right" });
      doc.text(formatCurrency(unitPrice), colX.price, rowY, { width: 60, align: "right" });
      doc.text(formatCurrency(totalAmount), colX.total, rowY, { width: 60, align: "right" });

      hr(doc, rowY + 16);

      // Summary
      const summaryTop = rowY + 40;
      doc.font("Helvetica-Bold").text("Total", colX.price, summaryTop, { width: 60, align: "right" });
      doc.font("Helvetica").text(formatCurrency(totalAmount), colX.total, summaryTop, { width: 60, align: "right" });

      // Notes
      doc.moveDown(4);
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280");
      doc.text("Thank you for your booking with PH Tour Management System! If you have any questions about this invoice, please contact support.", 50, summaryTop + 40, {
        width: 495,
      });
      doc.fillColor("#000000");

      // Finalize
      doc.end();
    });

    return pdfBuffer;
  } catch (error) {
    console.log(error);
    throw new AppError("PDF Generation error", httpStatus.BAD_REQUEST);
  }
};
