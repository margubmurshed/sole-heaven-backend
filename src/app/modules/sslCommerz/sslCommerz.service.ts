import { envVariables } from "../../config/env"
import AppError from "../../errorHelpers/AppError";
import { ISSLCommerz } from "./sslCommerz.interface";
import axios from "axios";
import httpStatus from "http-status-codes";

const sslPaymentInit = async (payload: ISSLCommerz) => {
    const data = {
        store_id: envVariables.SSL.SSL_STORE_ID,
        store_passwd: envVariables.SSL.SSL_STORE_PASS,
        total_amount: payload.amount,
        currency: "BDT",
        tran_id: payload.transactionId,
        success_url: `${envVariables.SSL.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
        fail_url: `${envVariables.SSL.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
        cancel_url: `${envVariables.SSL.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
        shipping_method: "N/A",
        product_name: "Tour",
        product_category: "Service",
        product_profile: "general",
        cus_name: payload.name,
        cus_email: payload.email,
        cus_add1: payload.address,
        cus_add2: "N/A",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1211",
        cus_country: "Bangladesh",
        cus_phone: payload.phone,
        cus_fax: "N/A",
        ship_name: "N/A",
        ship_add1: "N/A",
        ship_add2: "N/A",
        ship_city: "N/A",
        ship_state: "N/A",
        ship_postcode: "N/A",
        ship_country: "N/A",
    }

    try {
        const response = await axios({
            method: "POST",
            url: envVariables.SSL.SSL_PAYMENT_API,
            data,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.log(error);
        throw new AppError(error.message, httpStatus.BAD_REQUEST)
    }
}

export const SSLService = {
    sslPaymentInit
}