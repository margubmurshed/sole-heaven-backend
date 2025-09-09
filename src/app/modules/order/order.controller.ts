import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { OrderService } from "./order.service";

const createOrder = catchAsync(async (req: Request, res: Response) => {
    const jwtPayload = req.user as JwtPayload;
    const order = await OrderService.createOrder(req.body, jwtPayload.userId);
    console.log(order)
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Order created successfully",
        data: order
    })
})

const getOrders = catchAsync(async (req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await OrderService.getOrders(query);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "All orders retrieved successfully",
        data: result.data,
        meta: result.meta
    })
})

const getUserOrders = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const query = req.query as Record<string, string>;
    const result = await OrderService.getUserOrders(user.userId, query);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User orders retrieved successfully!",
        data: result.data,
        meta: result.meta
    })
})
const getSingleOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const booking = await OrderService.getSingleOrder(orderId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User Orders retrieved successfully!",
        data: booking
    })
})

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const result = await OrderService.updateOrderStatus(orderId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order status updated successfully",
        data: result
    })
})

const updateOrder = catchAsync(async (req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const result = await OrderService.updateOrder(orderId, req.body);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Order has been updated successfully",
        data: result
    })
})

export const OrderController = {
    createOrder,
    getOrders,
    getUserOrders,
    getSingleOrder,
    updateOrderStatus,
    updateOrder
};