import {
  Listener,
  NotFoundError,
  OrderStatus,
  PaymentCreatedEvent,
  PaymentCreatedEventData,
  Subjects,
} from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject = Subjects.PaymentCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: PaymentCreatedEventData, msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    order.set({ status: OrderStatus.COMPLETE });

    await order.save();

    msg.ack();
  }
}
