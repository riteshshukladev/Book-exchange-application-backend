import { Router } from "express";
import { BookExchangeIntializer } from "../controllers/BookExchangeController.js";


const exchangeRouter = Router();

exchangeRouter.post('/exchange-books', BookExchangeIntializer);

export default exchangeRouter;