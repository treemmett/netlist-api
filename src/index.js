import dotenv from 'dotenv';
import express from 'express';
import mongoose, { mongo } from 'mongoose';
import routes from './routes';

// Load env variables
dotenv.config();

const app = express();

// Don't crash on unhandles
app.on('uncaughtException', console.error);
app.on('uncaughtRejection', console.error);

// Set headers
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store');
  res.removeHeader('Connection');
  res.removeHeader('Date');
  res.removeHeader('X-Powered-By');
  next();
});

// Get database url
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT;
const dbName = process.env.DB_NAME;
const dbURL = `mongodb://${dbHost}:${dbPort}/${dbName}`;

// Connect to database
mongoose.connect(dbURL, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
mongoose.connection.on('error', console.error);
mongoose.connection.once('open', () => {

  // Start HTTP server
  app.use('/', routes);
  app.listen(process.env.PORT, () => console.log(`API listening on port ${process.env.PORT}`));
});
