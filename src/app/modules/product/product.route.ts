import { Router } from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { createCategorySchema, createProductSchema, updateCategorySchema, updateProductSchema } from "./product.validation";
import checkAuth from "../../../middlewares/checkAuth";
import { multerUpload } from "../../config/multer.config";

const router = Router();

// ----------------- Product Categories Routes -----------------
router.post("/category/create", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createCategorySchema),);
router.get("/category",);
router.get("/category/:id",);
router.patch("/category/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateCategorySchema),);
router.delete("/category/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN),);

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "images" },
        { name: "featuredImage", maxCount: 1 },
        { name: "sizeChartImage", maxCount: 1 }
    ]),
    validateRequest(createProductSchema),
);

router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "images" },
        { name: "featuredImage", maxCount: 1 },
        { name: "sizeChartImage", maxCount: 1 }
    ]),
    validateRequest(updateProductSchema),
);

router.get("/",);
router.get("/:id",);
router.delete("/:id",checkAuth(Role.ADMIN, Role.SUPER_ADMIN),);

export const ProductRoutes = router;