import { Router } from "express";
import signupController from "../controllers/signupController.js";

const authRouterSignup = Router()


authRouterSignup.post('/', signupController);

export default authRouterSignup;