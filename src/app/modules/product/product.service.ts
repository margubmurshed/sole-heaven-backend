import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { Category, ICategory, IProduct, Product } from "./product.model";
import { categorySearchableFields, productSearchableFields } from "./product.constant";

const createCategory = async (payload: ICategory) => {
    const doesCategoryExist = await Category.findOne({ name: payload.name });
    if (doesCategoryExist) {
        throw new AppError("Category already exists", httpStatus.BAD_REQUEST);
    }
    const category = await Category.create(payload);
    return category
}

const getCategories = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Category.find(), query);
    const categories = queryBuilder
        .filter()
        .search(categorySearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        categories.build(),
        queryBuilder.getMetaData()
    ]);
    return { data, meta };
}

const getSingleCategory = async (categoryID: string) => {
    const category = await Category.findById(categoryID);
    if (!category) {
        throw new AppError("Tour type not found", httpStatus.NOT_FOUND);
    }
    return category;
}

const updateCategory = async (categoryID: string, payload: Partial<ICategory>) => {
    const doesCategoryExist = await Category.findById(categoryID);
    if (!doesCategoryExist) {
        throw new AppError("Category not found", httpStatus.NOT_FOUND);
    }
    const duplicateCategory = await Category.findOne({
        name: payload.name,
        _id: { $ne: categoryID }
    });

    if (duplicateCategory) {
        throw new AppError("A tour type with this name already exists", httpStatus.BAD_REQUEST);
    }

    let existingFeaturedImage = doesCategoryExist.featuredImage;
    if(!payload.featuredImage) payload.featuredImage = existingFeaturedImage;

    const updatedCategory = await Category.findByIdAndUpdate(categoryID, payload, {
        new: true,
        runValidators: true
    });

    const deletedImagesExist = Array.isArray(payload.deletedImages) && payload.deletedImages.length;
    if (deletedImagesExist && existingFeaturedImage) {
        const deletableFeaturedImage = payload.deletedImages!.find((url) => url === existingFeaturedImage);
        if(deletableFeaturedImage){
            await deleteImageFromCloudinary(deletableFeaturedImage);
        }
    }


    return updatedCategory
}

const deleteCategory = async (CategoryID: string) => {
    const doesCategoryExist = await Category.findById(CategoryID);
    if (!doesCategoryExist) {
        throw new AppError("Category not found", httpStatus.NOT_FOUND);
    }
    await Category.findByIdAndDelete(CategoryID);
    return null;
}


/* Product Services------------------------- */

const createProduct = async (payload: IProduct) => {
    const doesProductExist = await Product.findOne({ name: payload.name });

    if (doesProductExist) {
        throw new AppError("Product with this name already exists", httpStatus.BAD_REQUEST);
    }

    const product = await Product.create(payload);
    return product;
}

const getProducts = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Product.find().populate([{path: 'category', select: 'name'}]), query);
    const products = queryBuilder
        .filter()
        .search(productSearchableFields)
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        products.build(),
        queryBuilder.getMetaData()
    ]);

    return {
        data,
        meta
    };
}

const getSingleProduct = async (slug: string) => {
    const product = await Product.findOne({ slug });
    if (!product) {
        throw new AppError("Product not found", httpStatus.NOT_FOUND);
    }
    return product;
}

const updateProduct = async (productID: string, payload: Partial<IProduct>) => {
    const doesProductExist = await Product.findById(productID);
    if (!doesProductExist) {
        throw new AppError("Product not found", httpStatus.NOT_FOUND);
    }

    const existingImages = Array.isArray(doesProductExist.images) ? [...doesProductExist.images] : [];
    const isImageUploaded = Array.isArray(payload.images) && payload.images.length > 0;
    const uploadedImages = isImageUploaded ? [...payload.images as string[]] : [];
    let filteredOldImages = existingImages;

    let existingFeaturedImage = doesProductExist.featuredImage;
    let existingSizeChartImage = doesProductExist.sizeChartImage;

    // remove deleted urls
    if (Array.isArray(payload.deletedImages) && payload.deletedImages.length) {
        filteredOldImages = existingImages.filter((imageURL: string) => !payload.deletedImages?.includes(imageURL))
    }
    payload.images = [...filteredOldImages, ...uploadedImages];

    if(!payload.featuredImage) payload.featuredImage = existingFeaturedImage;
    if(!payload.sizeChartImage) payload.sizeChartImage = existingSizeChartImage;


    const updatedProduct = await Product.findByIdAndUpdate(productID, payload, {
        new: true,
        runValidators: true
    });

    const deletedImagesExist = Array.isArray(payload.deletedImages) && payload.deletedImages.length;

    if (deletedImagesExist && existingImages.length) {
        const deletableImages = payload.deletedImages!.filter((url) => existingImages.includes(url));
        if(deletableImages.length){
            await Promise.all(deletableImages.map(imageURL => deleteImageFromCloudinary(imageURL)));
        }
    }

    if (deletedImagesExist && existingFeaturedImage) {
        const deletableFeaturedImage = payload.deletedImages!.find((url) => url === existingFeaturedImage);
        if(deletableFeaturedImage){
            await deleteImageFromCloudinary(deletableFeaturedImage);
        }
    }

    if (deletedImagesExist && existingSizeChartImage) {
        const deletableFeaturedImage = payload.deletedImages!.find((url) => url === existingSizeChartImage);
        if(deletableFeaturedImage){
            await deleteImageFromCloudinary(deletableFeaturedImage);
        }
    }

    return updatedProduct;
}

const deleteProduct = async (productID: string) => {
    const doesProductExist = await Product.findById(productID);
    if (!doesProductExist) {
        throw new AppError("Tour not found", httpStatus.NOT_FOUND);
    }
    await Product.findByIdAndDelete(productID);
    return null;
}

export const ProductService = {
    createCategory,
    getCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
    createProduct,
    getProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct
}