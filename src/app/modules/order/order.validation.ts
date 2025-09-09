import { z } from "zod";
import { Types } from "mongoose";
import { BDPhoneNumberSchema } from "../user/user.validation";

// Helper for MongoDB ObjectId validation
const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });

// Enum values
export const ORDER_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
  FAILED: "FAILED",
} as const;

export const PAYMENT_METHODS = ["COD", "SSLCOMMERZ"] as const;

// Billing address schema
const billingAddressSchema = z.object({
  name: z.string().nonempty("Name is required"),
  phone: BDPhoneNumberSchema.nonempty("Phone is required"),
  address: z.string().nonempty("Address is required"),
  city: z.string().nonempty("City is required"),
  district: z.string().nonempty("District is required"),
  postalCode: z.string().optional(),
});

// Product inside order
const orderProductSchema = z.object({
  product: objectId,
  quantity: z.number().int().positive("Quantity must be positive"),
  size: z.number().positive("Size must be positive")
});

// Create Order Schema
export const createOrderSchema = z.object({
  products: z.array(orderProductSchema).min(1, "At least one product is required"),
  shippingCost: z.number().nonnegative("Total amount must be non-negative"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  billingAddress: billingAddressSchema,
});

// Update Order Schema (all fields optional)
export const updateOrderSchema = z.object({
  orderStatus: z.nativeEnum(ORDER_STATUS).optional(),
  billingAddress: billingAddressSchema.partial().optional(),
  shippingCost: z.number().nonnegative("Total amount must be non-negative").optional()
});
