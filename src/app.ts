import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

// Load environment variables from .env file
dotenv.config();

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(morgan('combined'));

app.get('/', (req: Request, res: Response) => {
  res.json('Hello world!');
});

export default app;
