import express from 'express';
import cookieSession from 'cookie-session';
import 'express-async-errors';
import { NotFoundError, currentUser, errorHandler } from '@pcg-tickets/common';
import { indexGetRouter } from './routes/index.get';
import { indexPostRouter } from './routes/index.post';
import { orderIdGetRouter } from './routes/[id].get';
import { orderIdDeleteRouter } from './routes/[id].delete';

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

app.use(indexGetRouter);
app.use(indexPostRouter);
app.use(orderIdGetRouter);
app.use(orderIdDeleteRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);
