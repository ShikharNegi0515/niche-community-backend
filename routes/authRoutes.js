import express from "express";
import { signup, login, forgotPassword, resetPassword } from "../controllers/authController.js";
import { validateSignup, validateLogin } from "../middleware/validate.js";

const router = express.Router();

router.post("/signup", validateSignup, signup);
router.post("/login", validateLogin, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
