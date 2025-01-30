import { Router } from "express";
import { protectedRouterController,logout,refreshTokenController } from '../controllers/authController.js'
const authRouter = Router();

authRouter.post('/protected-route', protectedRouterController);
authRouter.post('/refresh-token', refreshTokenController);
authRouter.post('/logout', logout);


export default authRouter;
