import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

// Load environment variables from .env file
dotenv.config();

import { playlistController } from './controllers/playlist';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(morgan('combined'));

app.get('/', playlistController.get);

export default app;
