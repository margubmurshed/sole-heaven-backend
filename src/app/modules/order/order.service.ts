import AppError from "../../errorHelpers/AppError";
import { User } from "../user/user.model";
import httpStatus from "http-status-codes";
import z from "zod";
import mongoose from "mongoose";
import { QueryBuilder } from "../../../utils/QueryBuilder";
import { getTransactionId } from "../../../utils/getTransactionId";
import { createOrderSchema, updateOrderSchema } from "./order.validation";
import { Order } from "./order.model";
import { ORDER_STATUS } from "./order.interface";
import { Payment } from "../payment/payment.model";
import { PaymentStatus } from "../payment/payment.interface";
import { ISSLCommerz } from "../sslCommerz/sslCommerz.interface";
import { SSLService } from "../sslCommerz/sslCommerz.service";
import { Product } from "../product/product.model";

const createOrder = async (payload: z.infer<typeof createOrderSchema>, userId: string) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw new AppError("User not found", httpStatus.BAD_GATEWAY);
        }

        const transactionId = getTransactionId();

        const productIds = Array.from(new Set(payload.products.map(p => p.product)));
        const dbProducts = await Product.find({ _id: { $in: productIds } }).select("_id price").lean();
        if (dbProducts.length !== productIds.length) {
            throw new AppError("One or more products do not exist", httpStatus.BAD_REQUEST);
        }


        const totalProductsAmount = payload.products.reduce((acc, item) => {
            const product = dbProducts.find(p => p._id.toString() === item.product);
            return acc + (product?.price || 0) * item.quantity;
        }, 0);

        const totalAmount = totalProductsAmount + payload.shippingCost;


        const order = await Order.create([{
            ...payload,
            user: userId,
            totalAmount,
            status: ORDER_STATUS.PENDING
        }], { session })

        if (payload.paymentMethod === "SSLCOMMERZ") {
            const payment = await Payment.create([{
                order: order[0]._id,
                status: PaymentStatus.UNPAID,
                transactionId,
                amount: totalAmount
            }], { session })

            const updatedOrder = await Order.findByIdAndUpdate(
                order[0]._id,
                { payment: payment[0]._id },
                { new: true, runValidators: true }
            )
                .session(session);

            const sslPayload: ISSLCommerz = {
                name: payload.billingAddress.name,
                email: user.email,
                phone: payload.billingAddress.phone,
                address: payload.billingAddress.address,
                amount: totalAmount,
                transactionId
            }

            const sslPayment = await SSLService.sslPaymentInit(sslPayload);

            await session.commitTransaction();
            return {
                order: updatedOrder,
                paymentURL: sslPayment.GatewayPageURL
            };
        } else {
            await session.commitTransaction();
            return { order };
        }
    }
    catch (error) {
        await session.abortTransaction();
        throw error
    } finally {
        session.endSession();
    }
}
const getOrders = async (query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Order.find().populate("user", "name email"), query);
    const orders = queryBuilder.filter().fields().sort().paginate();
    const [data, meta] = await Promise.all([
        orders.build(),
        orders.getMetaData(),
    ])
    return { data, meta };
}

const getUserOrders = async (userId: string, query: Record<string, string>) => {
    const queryBuilder = new QueryBuilder(Order.find({ user: userId }).populate("user", "name email"), query);
    const orders = queryBuilder.filter().fields().sort().paginate();
    const [data, meta] = await Promise.all([
        orders.build(),
        orders.getMetaData(),
    ])
    return { data, meta };
}

const getSingleOrder = async (orderID: string) => {
    const isValid = mongoose.Types.ObjectId.isValid(orderID);
    if (!isValid) {
        throw new AppError("Invalid order id! Please provide valid id", httpStatus.BAD_REQUEST);
    }

    const order = await Order.findById(orderID)
        .populate("user", "name email")
        .populate("products.product", "name price featuredImage")
        .populate("payment");
    if (!order) {
        throw new AppError("No order found by this order id!", httpStatus.NOT_FOUND);
    }
    return order;
}

const updateOrderStatus = async (orderID: string, payload: z.infer<typeof updateOrderSchema>) => {
    const order = await Order.findById(orderID);
    if (!order) {
        throw new AppError("No order found!", httpStatus.NOT_FOUND);
    }

    if (payload.orderStatus) {
        order.orderStatus = payload.orderStatus as ORDER_STATUS;
    }
    await order.save();

    return order;
}

const updateOrder = async (orderID: string, payload: z.infer<typeof updateOrderSchema>) => {
    const order = await Order.findById(orderID);
    if (!order) {
        throw new AppError("No order found!", httpStatus.NOT_FOUND);
    }

    if (payload.orderStatus) {
        order.orderStatus = payload.orderStatus as ORDER_STATUS;
    }

    if (payload.billingAddress) {
        order.billingAddress = {
            ...order.billingAddress,
            ...payload.billingAddress,
        };
    }

    if (payload.shippingCost) {
        order.totalAmount = order.totalAmount - order.shippingCost;
        order.shippingCost = payload.shippingCost;
        order.totalAmount = order.totalAmount + order.shippingCost;
    }

    await order.save();
    return order;
}

export const OrderService = {
    createOrder,
    getOrders,
    getUserOrders,
    getSingleOrder,
    updateOrderStatus,
    updateOrder
}