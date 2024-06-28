import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@pcg-tickets/common';
import { natsClientWrapper } from '../nats-client-wrapper';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created.publisher';

const router = express.Router();

const validations = [
  body('token').not().isEmpty().withMessage('Token is required'),
  body('orderId').not().isEmpty().withMessage('OrderId must be provided'),
];

router.post(
  '/api/payments',
  requireAuth,
  validations,
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;
    const userId = req.currentUser!.id;

    const foundOrder = await Order.findById(orderId);

    if (!foundOrder) {
      throw new NotFoundError();
    }

    if (foundOrder.userId !== userId) {
      throw new NotAuthorizedError();
    }

    if (foundOrder.status === OrderStatus.CANCELLED) {
      throw new BadRequestError('Cannot pay for an cancelled order');
    }

    const stripeCharge = await stripe.charges.create({
      currency: 'usd',
      amount: foundOrder.price * 100,
      source: token,
      description: `Payment for order ${foundOrder.id}`,
    });

    const payment = Payment.build({
      orderId: foundOrder.id,
      stripeId: stripeCharge.id,
    });

    await payment.save();

    const paymentCreatedPublisher = new PaymentCreatedPublisher(
      natsClientWrapper.client,
    );

    await paymentCreatedPublisher.publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.stripeId,
    });

    res.status(201).send({ success: true, payment });
  },
);

export { router as indexPostRouter };
