/* eslint-disable @typescript-eslint/no-explicit-any */
import { Types } from "mongoose";

export enum PaymentStatus {
    PAID="PAID",
    UNPAID="UNPAID",
    CANCELLED="CANCELLED",
    FAILED="FAILED",
    REFUNDED="REFUNDED"
}

export interface IPayment {
    order: Types.ObjectId,
    transactionId: string,
    amount: number,
    paymentGatewayData?: any,
    invoiceUrl ?: string,
    status: PaymentStatus
}