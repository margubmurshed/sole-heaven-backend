import { z } from "zod";
import { Types } from "mongoose";

const objectId = z
  .string()
  .refine((val) => Types.ObjectId.isValid(val), { message: "Invalid ObjectId" });


export const createCategorySchema = z.object({
  name: z.string().nonempty("Category name is required").trim(),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  parent: objectId.optional(), // optional if it's a subcategory
});

export const updateCategorySchema = createCategorySchema.partial();

export const createProductSchema = z.object({
  name: z.string().nonempty("Product name is required").trim(),
  shortDescription: z
    .string(),
  brand: z.string().nonempty("Brand is required").trim(),
  description: z
    .string(),
  price: z.number().nonnegative("Price must be a positive number"),
  sku: z.string().nonempty("SKU is required").transform((val) => val.toUpperCase()),
  sizes: z.array(z.number().positive("Size must be positive")).nonempty("Sizes required"),
  stock: z.number().nonnegative().optional(),
  featuredImage: z.string().nonempty("Featured image is required").optional(),
  images: z.array(z.string().nonempty("Image URL required")).nonempty("At least one image required").optional(),
  sizeChartImage: z.string().optional(),
  category: objectId,
});

export const updateProductSchema = createProductSchema.partial().extend({
  deletedImages: z.array(z.string()).optional()
});
