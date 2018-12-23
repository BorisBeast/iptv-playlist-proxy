import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);

app.get('/', (req: Request, res: Response) => {
  res.json('Hello world!');
});

export default app;
