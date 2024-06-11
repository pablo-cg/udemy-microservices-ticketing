import express from 'express';
import cookieSession from 'cookie-session';
import 'express-async-errors';
import { currentUserRouter } from './routes/current-user';
import { signInRouter } from './routes/sign-in';
import { signOutRouter } from './routes/sign-out';
import { signUpRouter } from './routes/sign-up';
import { NotFoundError, errorHandler } from '@pcg-tickets/common';

export const app = express();

app.set('trust proxy', true);

app.use(express.json());

app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  }),
);

app.use(currentUserRouter);
app.use(signInRouter);
app.use(signOutRouter);
app.use(signUpRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);
