import { Schema, model, Document, Types } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
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
    deletedImages: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ICategory extends Document {
    name: string;
    description?: string;
    featuredImage?: string;
    deletedImages: string[];
    parent?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            maxlength: 500,
        },
        parent: {
            type: Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },
        featuredImage: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const Category = model<ICategory>("Category", categorySchema);

const productSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        shortDescription: {
            type: String,
            required: true,
        },
        brand: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
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



productSchema.pre("validate", async function (next) {
    if (this.isModified("name")) {
        const baseSlug = this.name.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}`;
        let counter = 0;

        while (await Product.exists({ slug })) {
            counter++;
            slug = `${slug}-${counter}`;
        }
        this.slug = slug;
    }
    next();
})

productSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate() as Partial<IProduct>;
    if (update.name) {
        const baseSlug = update.name.toLowerCase().split(' ').join('-');
        let slug = `${baseSlug}`;
        let counter = 0;

        while (await Product.exists({ slug })) {
            counter++;
            slug = `${baseSlug}-${counter}`;
        }
        update.slug = slug;
    }
    this.setUpdate(update);

    next();
})


export const Product = model<IProduct>("Product", productSchema);
