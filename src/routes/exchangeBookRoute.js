import { Router } from "express";
import { BookExchangeIntializer,fetchExchangeDetails,declineBookExchange,approveBookExchange} from "../controllers/BookExchangeController.js";




const exchangeRouter = Router();

exchangeRouter.post('/exchange-books', BookExchangeIntializer);
exchangeRouter.get('/exchanges', fetchExchangeDetails)
exchangeRouter.post('/decline-exchange', declineBookExchange)
exchangeRouter.post('/accept-exchange', approveBookExchange);

export default exchangeRouter;