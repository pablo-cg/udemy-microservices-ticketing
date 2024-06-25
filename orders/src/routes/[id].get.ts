import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@pcg-tickets/common';
import express, { type Request, type Response } from 'express';
import { Order } from '../models/order';
import mongoose from 'mongoose';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const userId = req.currentUser!.id;

    const isValidOrderId = mongoose.Types.ObjectId.isValid(orderId);

    if (!isValidOrderId) {
      throw new BadRequestError('Invalid orderId');
    }

    const order = await Order.findById(orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== userId) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  },
);

export { router as orderIdGetRouter };
