import { Schema, model, Document } from "mongoose";
import { IOrder, ORDER_STATUS, PAYMENT_STATUS } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "SSLCommerz"], required: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment"},
    orderStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
    billingAddress: {
      name: {type: String, required: true},
      phone: {type: String, required: true},
      address: {type: String, required: true},
      city: {type: String, required: true},
      district: {type: String, required: true},
      postalCode: String,
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);
