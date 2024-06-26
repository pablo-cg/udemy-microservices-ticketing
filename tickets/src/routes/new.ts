import { requireAuth, validateRequest } from '@pcg-tickets/common';
import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created.publisher';
import { natsClientWrapper } from '../nats-client-wrapper';

const router = express.Router();

const validations = [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
];

router.post(
  '/api/tickets',
  requireAuth,
  validations,
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;

    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });

    await ticket.save();

    const ticketCreatedPublisher = new TicketCreatedPublisher(
      natsClientWrapper.client,
    );

    ticketCreatedPublisher.publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
    });

    res.status(201).send(ticket);
  },
);

export { router as createTicketRouter };
