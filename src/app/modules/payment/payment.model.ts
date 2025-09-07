import { model, Schema } from "mongoose";
import { IPayment, PaymentStatus } from "./payment.interface";

const paymentSchema = new Schema<IPayment>({
    order: {
        type: Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true
    },
    transactionId: {
        type: String,
        required: true,
        unique: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    paymentGatewayData: {
        type: Schema.Types.Mixed,
        default: {}
    },
    invoiceUrl: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.UNPAID
    }
}, {
    timestamps: true
}); 

export const Payment = model<IPayment>("Payment", paymentSchema);