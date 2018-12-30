import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';

import { playlistController } from './controllers/playlist';

// Load environment variables from .env file
dotenv.config();

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 3000);
app.use(morgan('combined'));

app.get('/', playlistController.get);

export default app;
