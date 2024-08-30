import { Router } from "express";
import { allAuthors, allGenres, allBooks } from "../controllers/FilterController.js";

const filterRouter = Router();

filterRouter.get('/all-authors',allAuthors );
filterRouter.get('/all-genres',allGenres)
filterRouter.get('/all-books', allBooks)

export default filterRouter;
