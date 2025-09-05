import { Router } from "express"
import { UserRoutes } from "../app/modules/user/user.route";
import { AuthRoutes } from "../app/modules/auth/auth.route";
import { ProductRoutes } from "../app/modules/product/product.route";

export const router = Router();
const moduleRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/product", route: ProductRoutes },
]

moduleRoutes.forEach(route => {
    router.use(route.path, route.route)
})