import {
  ExpirationCompleteEvent,
  ExpirationCompleteEventData,
  Listener,
  NotFoundError,
  OrderStatus,
  Subjects,
} from '@pcg-tickets/common';
import { Message } from 'node-nats-streaming';
import { QUEUE_GROUP_NAME } from './queue-group-name';
import { Order } from '../../models/order';
import { OrderCancelledPublisher } from '../publishers/order-cancelled.publisher';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  subject = Subjects.ExpirationComplete;
  queueGroupName = QUEUE_GROUP_NAME;

  private orderCancelledPublisher = new OrderCancelledPublisher(this.client);

  async onMessage(data: ExpirationCompleteEventData, msg: Message) {
    const foundOrder = await Order.findById(data.orderId).populate('ticket');

    if (!foundOrder) {
      throw new NotFoundError();
    }

    if (foundOrder.status === OrderStatus.COMPLETE) {
      return msg.ack();
    }

    foundOrder.set({ status: OrderStatus.CANCELLED });

    await foundOrder.save();

    await this.orderCancelledPublisher.publish({
      id: foundOrder.id,
      version: foundOrder.version,
      ticket: {
        id: foundOrder.ticket.id,
      },
    });

    msg.ack();
  }
}
