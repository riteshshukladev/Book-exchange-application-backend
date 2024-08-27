import { Router } from "express";
import loginController from "../controllers/loginController.js";

const authRouterLogin = Router()

authRouterLogin.post('/', loginController);


export default authRouterLogin;