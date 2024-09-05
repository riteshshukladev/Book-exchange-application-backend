
import { Router } from 'express';
import { getBooks,editBook,deleteBook,addBook,countExchangeRequest } from '../controllers/BookController.js';

const bookRouter = Router();

bookRouter.get('/', getBooks);
bookRouter.post('/add', addBook);
bookRouter.put('/edit', editBook);
bookRouter.delete('/delete/:id', deleteBook);
bookRouter.get('/get-exchange-requests', countExchangeRequest);

export default bookRouter;