import { Schema, model } from "mongoose";
import { IOrder, ORDER_STATUS, PAYMENT_METHOD } from "./order.interface";

const orderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: Number,
        size: Number
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingCost: { type: Number, required: true },
    paymentMethod: { type: String, enum: Object.values(PAYMENT_METHOD), required: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment" },
    orderStatus: { type: String, enum: Object.values(ORDER_STATUS), default: ORDER_STATUS.PENDING },
    billingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
      postalCode: String,
    },
  },
  { timestamps: true }
);

export const Order = model<IOrder>("Order", orderSchema);
