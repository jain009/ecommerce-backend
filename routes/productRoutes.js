
import express from "express";
import checkObjectId from "../middleware/checkObjectId.js";
import {
  getProducts,
  getProductsById,
  deleteProduct,
  createProduct,
  updateProduct,
  createProductReview,
  getTopProducts
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(getProducts).post(protect, admin, createProduct);

router.get('/top', getTopProducts);

router.route("/:id")
  .get(getProductsById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route("/:id/reviews").post(protect, checkObjectId, createProductReview);

export default router;