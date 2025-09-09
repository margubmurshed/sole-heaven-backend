import { Router } from "express";
import { StatsController } from "./stats.controller";
import { Role } from "../user/user.interface";
import checkAuth from "../../../middlewares/checkAuth";
const router = Router();

router.get(
    "/",
    checkAuth(Role.SUPER_ADMIN, Role.ADMIN),
    StatsController.getStats
);

export const StatRoutes = router;