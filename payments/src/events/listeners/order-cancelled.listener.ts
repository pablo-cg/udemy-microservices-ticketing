import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  OrderCancelledEventData,
  OrderStatus,
  Subjects,
} from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject = Subjects.OrderCancelled;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCancelledEventData, msg: Message) {
    const foundOrder = await Order.findOne({
      _id: data.id,
      version: data.version - 1,
    });

    if (!foundOrder) {
      throw new NotFoundError();
    }

    foundOrder.set({ status: OrderStatus.CANCELLED });

    await foundOrder.save();

    msg.ack();
  }
}
