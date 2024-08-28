
import { Router } from 'express';
import { getBooks,editBook,deleteBook,addBook } from '../controllers/BookController.js';

const bookRouter = Router();

bookRouter.get('/', getBooks);
bookRouter.post('/add', addBook);
bookRouter.put('/edit', editBook);
bookRouter.delete('/delete/:id', deleteBook);

export default bookRouter