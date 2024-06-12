import express from 'express';
import cookieSession from 'cookie-session';
import 'express-async-errors';
import { NotFoundError, currentUser, errorHandler } from '@pcg-tickets/common';
import { createTicketRouter } from './routes/new';
import { getTicketRouter } from './routes/[id]';
import { getTicketsRouter } from './routes';
import { updateTicketRouter } from './routes/update';

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

app.use(createTicketRouter);
app.use(getTicketRouter);
app.use(getTicketsRouter);
app.use(updateTicketRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);
