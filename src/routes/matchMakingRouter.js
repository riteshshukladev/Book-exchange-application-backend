import { Router } from "express";

const matchMakingRouter = Router();
import { MatchingBooks } from "../controllers/matchMakingController.js";


matchMakingRouter.get('/matches', MatchingBooks)

export default matchMakingRouter