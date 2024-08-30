
import express from 'express';
const app = express();
import dotenv from "dotenv"
import bodyParser from 'body-parser';
import cors from "cors"
import testConnection from './src/config/database.js';
import authRouterLogin from './src/routes/authRouteLogin.js';
import authRouterSignup from './src/routes/authRouteSignup.js';
import bookRouter from './src/routes/bookRoute.js';
import authMiddleware from './src/middleware/authMiddleware.js';
dotenv.config();
const PORT = process.env.PORT; 


app.use(cors());
app.use(bodyParser.json());

testConnection(); 

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use('/login', authRouterLogin);
app.use('/signup', authRouterSignup);
app.use('/api/books', authMiddleware, bookRouter)
app.use('/api/filter', filterMiddleware, filterRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
