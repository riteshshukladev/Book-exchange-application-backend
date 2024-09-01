import { Router } from "express";
import { initialFetchUserData,updateUserProfile } from "../controllers/profileController.js";

const profileRouter = Router();


profileRouter.get('/initial-fetch', initialFetchUserData);
profileRouter.post('/update-profile',updateUserProfile)

export default profileRouter;
