import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@pcg-tickets/common';
import express, { type Request, type Response } from 'express';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled.publisher';
import { natsClientWrapper } from '../nats-client-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const isValidOrderId = mongoose.Types.ObjectId.isValid(orderId);

    if (!isValidOrderId) {
      throw new BadRequestError('Invalid orderId');
    }

    const userId = req.currentUser!.id;

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== userId) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.CANCELLED;

    await order.save();

    //publish an event

    const publisher = new OrderCancelledPublisher(natsClientWrapper.client);

    publisher.publish({
      id: order.id,
      ticket: {
        id: order.ticket.id,
      },
    });

    res.status(204).send(order);
  },
);

export { router as orderIdDeleteRouter };
