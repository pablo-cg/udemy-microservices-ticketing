import {
  Listener,
  OrderCreatedEvent,
  OrderCreatedEventData,
  Subjects,
} from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject = Subjects.OrderCreated;
  queueGroupName = QUEUE_GROUP_NAME;

  async onMessage(data: OrderCreatedEventData, msg: Message) {
    const order = Order.build({
      id: data.id,
      price: data.ticket.price,
      status: data.status,
      userId: data.userId,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
