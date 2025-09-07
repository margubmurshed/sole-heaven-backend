import { Router } from "express";
import checkAuth from "../../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import validateRequest from "../../../middlewares/validateRequest";
import { createOrderSchema, updateOrderSchema } from "./order.validation";
import { OrderController } from "./order.controller";

const router = Router();

router.post(
    "/",
    checkAuth(...Object.values(Role)),
    validateRequest(createOrderSchema),
    OrderController.createOrder
);

router.get(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    OrderController.getOrders
);

router.get(
    "/me",
    checkAuth(...Object.values(Role)),
    OrderController.getUserOrders
);

router.get(
    "/:orderId",
    checkAuth(...Object.values(Role)),
    OrderController.getSingleOrder
);

router.patch(
    "/:orderId/status",
    checkAuth(...Object.values(Role)),
    validateRequest(updateOrderSchema),
    OrderController.updateOrderStatus
);
router.patch(
    "/:orderId",
    checkAuth(...Object.values(Role)),
    validateRequest(updateOrderSchema),
    OrderController.updateOrder
);



export const OrderRoutes = router;