import { Router } from "express";
const AuthController = require("../controllers/auth/authController");

const router = Router();

router.post("/signup", AuthController.signUp);
router.post("/signin", AuthController.signIn);
router.post("/session/accept", AuthController.acceptSession);

export default router;
