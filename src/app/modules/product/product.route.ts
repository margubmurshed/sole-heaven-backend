import { Router } from "express";
import validateRequest from "../../../middlewares/validateRequest";
import { Role } from "../user/user.interface";
import { createCategorySchema, createProductSchema, updateCategorySchema, updateProductSchema } from "./product.validation";
import checkAuth from "../../../middlewares/checkAuth";
import { multerUpload } from "../../config/multer.config";
import { ProductController } from "./product.controller";

const router = Router();

// ----------------- Product Categories Routes -----------------
router.post("/category/create", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(createCategorySchema), ProductController.createCategory);
router.get("/category", ProductController.getCategories);
router.get("/category/:id", ProductController.getSingleCategory);
router.patch("/category/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateCategorySchema), ProductController.updateCategory);
router.delete("/category/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ProductController.deleteCategory);

router.post(
    "/create",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "images" },
        { name: "featuredImage", maxCount: 1 },
        { name: "sizeChartImage", maxCount: 1 }
    ]),
    validateRequest(createProductSchema), ProductController.createProduct
);

router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    multerUpload.fields([
        { name: "images" },
        { name: "featuredImage", maxCount: 1 },
        { name: "sizeChartImage", maxCount: 1 }
    ]),
    validateRequest(updateProductSchema), ProductController.updateProduct
);

router.get("/", ProductController.getProducts);
router.get("/:slug", ProductController.getSingleProduct);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ProductController.deleteProduct);

export const ProductRoutes = router;