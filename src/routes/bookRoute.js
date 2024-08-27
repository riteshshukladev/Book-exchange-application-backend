
import { Router } from 'express';
// const bookController = require('../controllers/bookController');

const bookRouter = Router();

bookRouter.post('/', bookController.getBooks);
bookRouter.post('/add', bookController.addBook);
bookRouter.put('/edit', bookController.editBook);
bookRouter.delete('/delete', bookController.deleteBook);

module.exports = bookRouter;