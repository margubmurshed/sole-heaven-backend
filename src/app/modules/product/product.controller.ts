import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/AppError";
import { IProduct } from "./product.model";
import { ProductService } from "./product.service";


/* Category Controllers ------------------------------------------------*/
const createCategory = catchAsync(async (req: Request, res: Response) => {
    const category = await ProductService.createCategory(req.body);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Category created successfully!",
        data: category
    });
})

const getCategories = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await ProductService.getCategories(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All categories retrieved successfully!",
        data: result.data,
        meta: result.meta
    });
})

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryID = req.params.id;
    const result = await ProductService.getSingleCategory(categoryID);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category retrieved successfully!",
        data: result,
    });
})

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryID = req.params.id;
    const updatedCategory = await ProductService.updateCategory(categoryID, req.body);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category updated successfully!",
        data: updatedCategory
    });
})

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const categoryID = req.params.id;
    const result = await ProductService.deleteCategory(categoryID);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Category deleted successfully!",
        data: result
    });
})

/* Tour Controllers ----------------------------------------------------------*/
const createProduct = catchAsync(async (req: Request, res: Response) => {
    const files = req.files as Record<string, Express.Multer.File[]>
    const featuredImage = files.featuredImage?.[0]
    const sizeChartImage = files.sizeChartImage?.[0]
    const images = files.images || []

    const payload: IProduct = {
        ...req.body,
        images: images.map(file => file.path),
        featuredImage: featuredImage ? featuredImage.path : "",
        sizeChartImage: sizeChartImage ? sizeChartImage.path : "",
    }

    if (!payload.images || payload.images.length === 0) {
        throw new AppError("At least one image is required for the product.", httpStatus.BAD_REQUEST);
    }
    if (!payload.featuredImage) {
        throw new AppError("Featured image is required for the product.", httpStatus.BAD_REQUEST);
    }

    const product = await ProductService.createProduct(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Product created successfully!",
        data: product
    });
})

const getProducts = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await ProductService.getProducts(query);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All products retrieved successfully!",
        data: result.data,
        meta: result.meta
    });
})


const getSingleProduct = catchAsync(async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const result = await ProductService.getSingleProduct(slug);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "All tours retrieved successfully!",
        data: result
    });
})

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const productID = req.params.id;
    const files = req.files as Record<string, Express.Multer.File[]>
    const featuredImage = files.featuredImage?.[0]
    const sizeChartImage = files.sizeChartImage?.[0]
    const images = files.images || []

    const payload: Partial<IProduct> = {
        ...req.body,
        images: images.map(file => file.path),
        featuredImage: featuredImage ? featuredImage.path : "",
        sizeChartImage: sizeChartImage ? sizeChartImage.path : "",
    }

    const updatedProduct = await ProductService.updateProduct(productID, payload);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product updated successfully!",
        data: updatedProduct
    });
})

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const productID = req.params.id;
    const result = await ProductService.deleteProduct(productID);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Product deleted successfully!",
        data: result
    });
})

export const ProductController = {
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