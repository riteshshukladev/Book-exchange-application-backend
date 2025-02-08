import { Router } from "express";
import { getAllFilters,filteredBooks, } from "../controllers/FilterController.js";

const filterRouter = Router();

filterRouter.get('/initial-filter-fetch', getAllFilters);
filterRouter.post('/custom-filter', filteredBooks);

export default filterRouter;
