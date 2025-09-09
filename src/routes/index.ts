import { Router } from "express"
import { UserRoutes } from "../app/modules/user/user.route";
import { AuthRoutes } from "../app/modules/auth/auth.route";
import { ProductRoutes } from "../app/modules/product/product.route";
import { OrderRoutes } from "../app/modules/order/order.route";
import { PaymentRoutes } from "../app/modules/payment/payment.route";
import { OTPRoutes } from "../app/modules/otp/otp.route";
import { StatRoutes } from "../app/modules/stats/stats.route";

export const router = Router();
const moduleRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/product", route: ProductRoutes },
    { path: "/order", route: OrderRoutes },
    { path: "/payment", route: PaymentRoutes },
    { path: "/otp", route: OTPRoutes },
    { path: "/stats", route: StatRoutes },
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})