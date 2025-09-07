import mongoose from "mongoose"
import { Payment } from "./payment.model";
import { PaymentStatus } from "./payment.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { generateInvoicePDF, IInvoiceData, IInvoiceProduct } from "../../../utils/invoice";
import { IUser } from "../user/user.interface";
import { sendEmail } from "../../../utils/sendEmail";
import { uploadBufferToCloudinary } from "../../config/cloudinary.config";
import { Order } from "../order/order.model";
import { ORDER_STATUS } from "../order/order.interface";

const initPayment = async (orderID: string) => {
    const payment = await Payment.findOne({ order: orderID });

    if (!payment) {
        throw new AppError("Payment not found! You might not have initiated order!", httpStatus.NOT_FOUND);
    }

    const order = await Order.findById(orderID).populate("user", "name, email, phone, address");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = order?.user as any;

    const sslPayload: ISSLCommerz = {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        amount: payment.amount,
        transactionId: payment.transactionId
    }

    const sslPayment = await SSLService.sslPaymentInit(sslPayload);
    return {
        paymentURL: sslPayment.GatewayPageURL
    }
}

const successPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PaymentStatus.PAID },
            { new: true, runValidators: true }
        ).session(session);

        const updatedOrder = await Order.findByIdAndUpdate(
            updatedPayment?.order,
            { orderStatus: ORDER_STATUS.CONFIRMED },
            { runValidators: true, new: true }
        ).session(session).populate([
            { path: "user", select: "name email" },
            { path: "products.product", select: "name price" }
        ])

        console.log(updatedOrder, "success payment")

        if (!updatedOrder) throw new AppError("Order not found", httpStatus.NOT_FOUND)
        if (!updatedPayment) throw new AppError("Payment not found", httpStatus.NOT_FOUND)

        const invoiceData: IInvoiceData = {
            orderDate: updatedOrder.createdAt,
            totalAmount: updatedPayment.amount,
            customerName: (updatedOrder.user as Partial<IUser>).name as string,
            orderId: updatedPayment?.order,
            billingAddress: updatedOrder.billingAddress,
            paymentMethod: updatedOrder.paymentMethod,
            shippingCost: updatedOrder.shippingCost,
            products: updatedOrder.products.map((p) => ({
                product: {
                    name: (p.product as any).name,
                    price: (p.product as any).price,
                },
                quantity: p.quantity,
                size: p.size,
            }))
        }

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cloudinaryResult: any = await uploadBufferToCloudinary(pdfBuffer, "invoice")

        updatedPayment.invoiceUrl = cloudinaryResult.secure_url;
        await updatedPayment.save({ session })

        await sendEmail({
            to: (updatedOrder.user as Partial<IUser>).email as string,
            subject: "Your Order Invoice",
            templateName: "invoice",
            templateData: invoiceData,
            attachments: [{
                filename: "invoice.pdf",
                content: pdfBuffer,
                contentType: "application/pdf"
            }]
        })

        await session.commitTransaction()
        return {
            success: true,
            message: "Payment Completed Successfully!"
        }

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}

const failPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PaymentStatus.FAILED },
            { new: true, runValidators: true }
        ).session(session);

        await Order.findByIdAndUpdate(
            updatedPayment?.order,
            { status: ORDER_STATUS.FAILED },
            { runValidators: true }
        ).session(session)

        await session.commitTransaction()
        return {
            success: false,
            message: "Payment Failed!"
        }

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}

const cancelPayment = async (query: Record<string, string>) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const updatedPayment = await Payment.findOneAndUpdate(
            { transactionId: query.transactionId },
            { status: PaymentStatus.CANCELLED },
            { new: true, runValidators: true }
        ).session(session);

        await Order.findByIdAndUpdate(
            updatedPayment?.order,
            { status: ORDER_STATUS.CANCELLED },
            { runValidators: true }
        ).session(session)

        await session.commitTransaction()
        return {
            success: false,
            message: "Payment Cancelled!"
        }

    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        await session.endSession();
    }
}

export const PaymentService = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment
}