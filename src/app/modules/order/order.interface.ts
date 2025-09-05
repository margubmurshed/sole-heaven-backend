import { Schema } from "mongoose";

export enum PAYMENT_STATUS {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED"
}

export enum ORDER_STATUS {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    SHIPPED = "SHIPPED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}

export interface IOrder extends Document {
  user: Schema.Types.ObjectId;
  products: {
    productId: Schema.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: "COD" | "SSLCommerz";
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
}