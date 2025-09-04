import { z } from "zod";
import { Types } from "mongoose";

const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });

export const createProductSchema = z.object({
  name: z.string().nonempty("Product name is required").trim(),
  shortDescription: z
    .string()
    .max(160, "Short description must be at most 160 characters"),
  brand: z.string().nonempty("Brand is required").trim(),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters"),
  price: z.number().nonnegative("Price must be a positive number"),
  sku: z.string().nonempty("SKU is required").transform((val) => val.toUpperCase()),
  sizes: z.array(z.number().positive("Size must be positive")).nonempty("Sizes required"),
  stock: z.number().nonnegative().optional(),
  featuredImage: z.string().nonempty("Featured image is required"),
  images: z.array(z.string().nonempty("Image URL required")).nonempty("At least one image required"),
  sizeChartImage: z.string().optional(),
  category: objectId,
});

export const updateProductSchema = createProductSchema.partial();
