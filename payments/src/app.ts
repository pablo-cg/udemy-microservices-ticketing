import express from 'express';
import cookieSession from 'cookie-session';
import 'express-async-errors';
import { NotFoundError, currentUser, errorHandler } from '@pcg-tickets/common';
import { indexPostRouter } from './routes/index.post';

export const app = express();

app.set('trust proxy', true);

app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  }),
);

app.use(currentUser);

app.use(indexPostRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);
