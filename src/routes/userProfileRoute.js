import { Router } from "express";
import { initialFetchUserData } from "../controllers/profileController.js";

const profileRouter = Router();


profileRouter.get('/initial-fetch', initialFetchUserData);

export default profileRouter;
