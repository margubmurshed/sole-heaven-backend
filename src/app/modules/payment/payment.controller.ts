import { Request, Response } from "express";
import catchAsync from "../../../utils/catchAsync";
import { PaymentService } from "./payment.service";
import { envVariables } from "../../config/env";
import sendResponse from "../../../utils/sendResponse";
import httpStatus from "http-status-codes";

const initPayment = catchAsync(async(req: Request, res: Response) => {
    const orderId = req.params.orderId;
    const result = await PaymentService.initPayment(orderId);
    
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "Payment URL created successfully",
        data: result
    })
})

const successPayment = catchAsync(async(req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentService.successPayment(query);
    if(result.success){
        res.redirect(`${envVariables.SSL.SSL_SUCCESS_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&message=${result.message}&status=${query.status}`);
    }
})
const failPayment = catchAsync(async(req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentService.failPayment(query);
    if(!result.success){
        res.redirect(`${envVariables.SSL.SSL_FAIL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&message=${result.message}&status=${query.status}`);
    }
})
const cancelPayment = catchAsync(async(req: Request, res: Response) => {
    const query = req.query as Record<string, string>;
    const result = await PaymentService.cancelPayment(query);
    if(!result.success){
        res.redirect(`${envVariables.SSL.SSL_CANCEL_FRONTEND_URL}?transactionId=${query.transactionId}&amount=${query.amount}&message=${result.message}&status=${query.status}`);
    }
})

export const PaymentController = {
    successPayment,
    failPayment,
    cancelPayment,
    initPayment
}