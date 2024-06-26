import mongoose from 'mongoose';
import express, { type Request, type Response } from 'express';
import { body } from 'express-validator';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@pcg-tickets/common';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created.publisher';
import { natsClientWrapper } from '../nats-client-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

const validations = [
  body('ticketId')
    .not()
    .isEmpty()
    .custom((ticketId: string) => mongoose.Types.ObjectId.isValid(ticketId))
    .withMessage('TicketId must be provided'),
];

router.post(
  '/api/orders',
  requireAuth,
  validations,
  validateRequest,
  async (req: Request, res: Response) => {
    // find the ticket
    const { ticketId } = req.body;

    const foundTicket = await Ticket.findById(ticketId);

    if (!foundTicket) {
      throw new NotFoundError();
    }

    // make sure the ticket is not reserved
    // find order where ticket is the ticket we just found and order status is not cancelled
    const isTicketReserved = await foundTicket.isReserved();

    if (isTicketReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // calculate order expiration date
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // build the order and save it to database
    const newOrder = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.CREATED,
      ticket: foundTicket,
      expiresAt: expiration,
    });

    await newOrder.save();

    // publish event order:created
    const publisher = new OrderCreatedPublisher(natsClientWrapper.client);

    publisher.publish({
      id: newOrder.id,
      status: newOrder.status,
      userId: newOrder.userId,
      expiresAt: newOrder.expiresAt.toISOString(),
      version: newOrder.version,
      ticket: {
        id: newOrder.ticket.id,
        price: newOrder.ticket.price,
      },
    });

    res.status(201).send(newOrder);
  },
);

export { router as indexPostRouter };
