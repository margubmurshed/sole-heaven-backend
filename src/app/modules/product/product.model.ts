import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
    name: string;
    shortDescription: string;
    brand: string;
    description: string;
    price: number;
    sku: string;
    sizes: number[];
    stock: number;
    featuredImage: string;
    images: string[];
    sizeChartImage?: string;
    category: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        shortDescription: {
            type: String,
            required: true,
            maxlength: 160, // SEO/meta-friendly short text
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            maxlength: 2000,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        sku: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },
        sizes: {
            type: [Number],
            required: true,
        },
        stock: {
            type: Number,
            default: 0,
        },
        featuredImage: {
            type: String,
            required: true,
        },
        images: {
            type: [String],
            required: true,
        },
        sizeChartImage: {
            type: String,
        },
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            required: true
        },
    },
    { timestamps: true }
);

export const Product = model<IProduct>("Product", productSchema);
