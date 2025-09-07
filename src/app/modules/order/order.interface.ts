import { Schema } from "mongoose";

export enum ORDER_STATUS {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED",
    FAILED = "FAILED"
}

export enum PAYMENT_METHOD{
  COD="COD",
  SSLCOMMERZ="SSLCOMMERZ"
}

export interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  products: {
    product: Schema.Types.ObjectId;
    quantity: number;
    size: number;
  }[];
  totalAmount: number;
  shippingCost: number;
  paymentMethod: PAYMENT_METHOD;
  payment?: Schema.Types.ObjectId;
  orderStatus: ORDER_STATUS;
  billingAddress: {
    name: string;
    phone: string;
    address: string;
    district: string;
    city: string;
    postalCode?: string;
  };
  createdAt: Date;
}