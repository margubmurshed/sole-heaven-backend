/* eslint-disable no-console */
import PDFDocument from "pdfkit";
import AppError from "../app/errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { Types } from "mongoose";
import { PAYMENT_METHOD } from "../app/modules/order/order.interface";

export interface IInvoiceProduct {
    product: {
      name: string;
      price: number;
    }
    quantity: number;
    size: number;
  }

export interface IInvoiceData {
  orderId: Types.ObjectId;
  orderDate: Date;
  customerName: string;
  billingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    postalCode?: string;
  };
  shippingCost: number;
  products: IInvoiceProduct[];
  paymentMethod: PAYMENT_METHOD;
  totalAmount: number;
}

// Format helpers
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
  }).format(amount);

const formatDate = (date: Date, locale = "en-GB") =>
  new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(date);

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

export const generateInvoicePDF = async (
  invoiceData: IInvoiceData
): Promise<Buffer> => {
  try {
    const {
      orderId,
      orderDate,
      customerName,
      billingAddress,
      products,
      paymentMethod,
      totalAmount,
    } = invoiceData;

    const buffer: Uint8Array[] = [];

    const pdfBuffer: Buffer = await new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      doc.on("data", (chunk) => buffer.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffer)));
      doc.on("error", (err) => reject(err));

      // Header
      doc.font("Helvetica-Bold").fontSize(18).text("Sole Heaven", 50, 50);
      doc.font("Helvetica").fontSize(10).fillColor("#4b5563");
      doc.text("Dhaka, Bangladesh", 120, 65);
      doc.text("Phone: +8801988474979", 120, 80);
      doc.text("Website: www.soleheaven.com", 120, 95);
      doc.fillColor("#000000");

      doc.font("Helvetica-Bold").fontSize(24).text("Invoice", { align: "right" });
      hr(doc, 120);

      // Billing & Invoice details
      const leftY = 140;
      doc.font("Helvetica-Bold").fontSize(12).text("Billed To", 50, leftY);
      doc.font("Helvetica").fontSize(12).text(customerName, 50, leftY + 18);
      doc.text(billingAddress.address, 50, leftY + 34);
      doc.text(
        `${billingAddress.city}, ${billingAddress.district}, ${billingAddress.postalCode ?? ""}`,
        50,
        leftY + 50
      );
      doc.text(`Phone: ${billingAddress.phone}`, 50, leftY + 66);

      const rightX = 320;
      doc.font("Helvetica-Bold").text("Invoice Details", rightX, leftY);
      doc.font("Helvetica").text(`Order ID: ${orderId}`, rightX, leftY + 18);
      doc.text(`Order Date: ${formatDate(orderDate)}`, rightX, leftY + 36);
      doc.text(`Payment Method: ${paymentMethod}`, rightX, leftY + 54);

      hr(doc, 220);

      // Table header
      const tableTop = 240;
      const colX = { item: 50, qty: 330, price: 400, total: 480 } as const;

      doc.font("Helvetica-Bold").fontSize(12);
      doc.text("Product", colX.item, tableTop);
      doc.text("Qty", colX.qty, tableTop, { width: 50, align: "right" });
      doc.text("Price", colX.price, tableTop, { width: 60, align: "right" });
      doc.text("Amount", colX.total, tableTop, { width: 60, align: "right" });

      hr(doc, tableTop + 18);

      // Products
      let y = tableTop + 32;
      doc.font("Helvetica").fontSize(12);

      products.forEach((p) => {
        doc.text(p.product.name, colX.item, y, { width: 260 });
        doc.text(String(p.quantity), colX.qty, y, { width: 50, align: "right" });
        doc.text(formatCurrency(p.product.price), colX.price, y, { width: 60, align: "right" });
        doc.text(formatCurrency(p.product.price * p.quantity), colX.total, y, { width: 60, align: "right" });
        y += 20;
      });

      hr(doc, y + 4);

      // Total
      const summaryTop = y + 20;
      doc.font("Helvetica-Bold").text("Total", colX.price, summaryTop, { width: 60, align: "right" });
      doc.font("Helvetica").text(formatCurrency(totalAmount), colX.total, summaryTop, { width: 60, align: "right" });

      // Footer note
      doc.moveDown(4);
      doc.font("Helvetica").fontSize(10).fillColor("#6b7280");
      doc.text(
        "Thank you for shopping with Sole Heaven! If you have any questions about this invoice, please contact support.",
        50,
        summaryTop + 40,
        { width: 495 }
      );
      doc.fillColor("#000000");

      doc.end();
    });

    return pdfBuffer;
  } catch (error) {
    console.log(error);
    throw new AppError("PDF Generation error", httpStatus.BAD_REQUEST);
  }
};
